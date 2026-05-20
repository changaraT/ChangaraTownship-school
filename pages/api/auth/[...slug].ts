import { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";
import { serialize, SerializeOptions } from "cookie";
import { supabase } from "../../../lib/server/supabase";
import { getFullUserProfile, JWT_SECRET } from "../../../lib/server/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;
  const action = Array.isArray(slug) ? slug[0] : slug;
  const isProd = process.env.NODE_ENV === "production";
  const cookieOptions: SerializeOptions = {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    path: "/",
  };

  try {
    if (action === "signup") {
      if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
      const { email, password, role } = req.body;
      const lowerEmail = email.toLowerCase();
      if (role === 'headteacher' && lowerEmail !== "changaratownship@gmail.com") {
        return res.status(403).json({ error: "Unauthorized Headteacher email" });
      }
      const { error } = await supabase.auth.signUp({
        email: lowerEmail,
        password,
        options: {
          data: { role },
          emailRedirectTo: `${process.env.APP_URL || "https://changara-school.vercel.app"}/login`
        }
      });
      if (error) return res.status(400).json({ error: error.message });
      return res.json({ message: "Check email to confirm account." });
    }

    if (action === "login") {
      if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
      const { email, password } = req.body;
      const lowerEmail = (email || '').toLowerCase();

      // First try Supabase native auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email: lowerEmail, password });
      if (authData?.user) {
        const { data: user } = await supabase.from("users").select("id, email, role").eq("id", authData.user.id).single();
        if (!user) return res.status(404).json({ error: "Profile not found" });
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
        res.setHeader("Set-Cookie", serialize("token", token, { ...cookieOptions, maxAge: 86400 }));
        return res.json(await getFullUserProfile({ id: user.id, email: user.email, role: user.role }));
      }

      // Fallback: attempt local authentication against users table (headteacher-provisioned credentials)
      const { data: localUser } = await supabase.from('users').select('id, email, role, password_hash').ilike('email', lowerEmail).maybeSingle();
      if (localUser && localUser.password_hash) {
        const { verifyPassword } = await import('../../../lib/server/auth');
        const ok = verifyPassword(password, localUser.password_hash);
        if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
        const token = jwt.sign({ id: localUser.id, email: localUser.email, role: localUser.role }, JWT_SECRET, { expiresIn: '1d' });
        res.setHeader('Set-Cookie', serialize('token', token, { ...cookieOptions, maxAge: 86400 }));
        return res.json(await getFullUserProfile({ id: localUser.id, email: localUser.email, role: localUser.role }));
      }

      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (action === 'logout') {
      res.setHeader('Set-Cookie', serialize('token', '', { ...cookieOptions, expires: new Date(0) }));
      return res.json({ message: 'Logged out' });
    }

    if (action === 'me') {
      try {
        const token = req.cookies?.token || (req.headers.cookie || '').split(';').reduce((acc: any, c: string) => { const [k, v] = c.trim().split('='); acc[k] = v; return acc; }, {})?.token;
        if (!token) return res.status(401).json({ error: 'Unauthorized' });
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        return res.json(await getFullUserProfile(decoded));
      } catch (e: any) {
        return res.status(401).json({ error: 'Invalid token' });
      }
    }

    return res.status(404).json({ error: "Endpoint not found" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
