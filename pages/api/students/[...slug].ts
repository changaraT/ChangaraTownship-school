import { VercelResponse } from "@vercel/node";
import { supabase } from "../../../lib/server/supabase";
import { authenticate, AuthenticatedRequest } from "../../../lib/server/auth";

export default async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  const { slug } = req.query;
  const id = Array.isArray(slug) ? slug[0] : null;

  try {
    const user = authenticate(req, res);

    // GET /api/students
    if (req.method === "GET") {
      let query = supabase.from("students").select("*").order("name");
      if (user.role === "teacher") {
        const { data: teacher } = await supabase.from("teachers").select("classes").eq("user_id", user.id).single();
        if (!teacher?.classes?.length) return res.json([]);
        query = query.in("class", teacher.classes);
      }
      const { data, error } = await query;
      if (error) throw error;
      return res.json(data);
    }

    // POST /api/students
    if (req.method === "POST") {
      if (user.role !== "headteacher" && user.role !== "teacher") return res.status(403).json({ error: "Forbidden" });
      const { admission_number, name, class: className, parents } = req.body;
      const { data: student, error } = await supabase.from("students").insert({
        admission_number, name, class: className, 
        parent_name: parents?.[0]?.name, parent_email: parents?.[0]?.email, parent_phone: parents?.[0]?.phone
      }).select().single();
      if (error) throw error;

      if (parents && Array.isArray(parents)) {
        for (const p of parents) {
          if (p.email) {
            const lowerEmail = p.email.toLowerCase();
            const { data: exists } = await supabase.from("users").select("id").eq("email", lowerEmail).single();
            if (!exists) {
              await supabase.auth.signUp({ email: lowerEmail, password: admission_number.toString(), options: { data: { role: "parent" } } });
            }
            await supabase.from("parents").insert({ name: p.name || "Parent", email: lowerEmail, phone: p.phone, student_id: student.id });
          }
        }
      }
      return res.json({ message: "Student admitted", student });
    }

    // PATCH /api/students/[id]
    if (req.method === "PATCH" && id) {
      if (user.role !== "headteacher") return res.status(403).json({ error: "Forbidden" });
      const { data, error } = await supabase.from("students").update(req.body).eq("id", id).select().single();
      if (error) throw error;
      return res.json({ message: "Updated", student: data });
    }

    // DELETE /api/students/[id]
    if (req.method === "DELETE" && id) {
      if (user.role !== "headteacher") return res.status(403).json({ error: "Forbidden" });
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) throw error;
      return res.json({ message: "Deleted" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
