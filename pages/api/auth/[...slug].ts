import { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import { supabase } from "../_utils/supabase";
import { getFullUserProfile, JWT_SECRET, authenticate } from "../_utils/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;
  const action = Array.isArray(slug) ? slug[0] : slug;
  const isProd = process.env.NODE_ENV === "production";
  const cookieOptions = {
    httpOnly: true,
    sameSite: (isProd ? "none" : "lax") as const,
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
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email: email.toLowerCase(), password });
      if (authError || !authData.user) return res.status(401).json({ error: "Invalid credentials" });
      const { data: user } = await supabase.from("users").select("*").eq("id", authData.user.id).single();
      if (!user) return res.status(404).json({ error: "Profile not found" });
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
      res.setHeader("Set-Cookie", serialize("token", token, { ...cookieOptions, maxAge: 86400 }));
      return res.json(await getFullUserProfile({ id: user.id, email: user.email, role: user.role }));
    }

    if (action === "logout") {
      res.setHeader("Set-Cookie", serialize("token", "", { ...cookieOptions, expires: new Date(0) }));
      return res.json({ message: "Logged out" });
    }

    if (action === "me") {
      const decoded = authenticate(req as any, res);
      const { data: user } = await supabase.from("users").select("id, email, role").eq("id", decoded.id).single();
      if (!user) return res.status(404).json({ error: "User not found" });
      return res.json(await getFullUserProfile(user));
    }

    return res.status(404).json({ error: "Endpoint not found" });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
}
