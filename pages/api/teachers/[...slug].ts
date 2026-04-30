import { VercelResponse } from "@vercel/node";
import { supabase } from "../../../lib/server/supabase";
import { authenticate, AuthenticatedRequest } from "../../../lib/server/auth";
import { sendEmail } from "../../../lib/server/mail";

export default async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  const { slug } = req.query;
  const action = Array.isArray(slug) ? slug[0] : slug;

  try {
    const user = authenticate(req, res);
    if (user.role !== "headteacher") return res.status(403).json({ error: "Forbidden" });

    if (req.method === "GET") {
      if (action === "allocation-matrix") {
        const { data } = await supabase.from("teachers").select("name, assignments");
        const matrix: any = {};
        data?.forEach(t => t.assignments?.forEach((ass: any) => {
          if (!matrix[ass.class]) matrix[ass.class] = {};
          if (!matrix[ass.class][ass.subject]) matrix[ass.class][ass.subject] = [];
          matrix[ass.class][ass.subject].push(t.name);
        }));
        return res.json(matrix);
      }
      
      const { data, error } = await supabase.from("teachers").select("*, users!inner(email)");
      if (error) throw error;
      return res.json(data.map(t => ({ ...t, email: (t as any).users.email })));
    }

    if (req.method === "POST") {
      const { email, password, name, assignments, teacher_role } = req.body;
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase(), password, options: { data: { role: "teacher" } }
      });
      if (authError || !authData.user) throw authError || new Error("Failed to create user");

      const classes = Array.from(new Set(assignments.map((a: any) => a.class)));
      const subjects = Array.from(new Set(assignments.map((a: any) => a.subject)));
      
      const { error } = await supabase.from("teachers").insert({
          user_id: authData.user.id, name, classes, subjects, assignments, teacher_role: teacher_role || "Subject Teacher"
      });
      if (error) throw error;

      await sendEmail({
        to: email, subject: "Welcome to Changara Township School",
        htmlContent: `<h1>Greetings ${name}</h1><p>Credentials: <b>${email}</b> / <b>${password}</b></p>`
      });
      return res.json({ message: "Teacher created" });
    }

    if (req.method === "DELETE" && action) {
      const { data: t } = await supabase.from("teachers").select("user_id").eq("id", action).single();
      if (t) await supabase.from("users").delete().eq("id", t.user_id);
      const { error } = await supabase.from("teachers").delete().eq("id", action);
      if (error) throw error;
      return res.json({ message: "Teacher deleted" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
