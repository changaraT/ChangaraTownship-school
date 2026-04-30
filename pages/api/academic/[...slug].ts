import { VercelResponse } from "@vercel/node";
import { supabase } from "../_utils/supabase";
import { authenticate, AuthenticatedRequest } from "../_utils/auth";

export default async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  const { slug } = req.query;
  const path = Array.isArray(slug) ? slug.join('/') : slug;

  try {
    const user = authenticate(req, res);

    if (path.startsWith('results')) {
        const id = path.split('/')[1];
        if (req.method === "GET") {
            const { studentId, term, year, examType, className } = req.query;
            let q = supabase.from("exam_results").select("*");
            if (studentId) q = q.eq("student_id", studentId);
            if (term) q = q.eq("term", term);
            if (className) q = q.eq("class", className);
            const { data, error } = await q;
            if (error) throw error;
            return res.json(data);
        }
        if (req.method === "POST" || (req.method === "PATCH" && id)) {
            if (user.role !== "headteacher" && user.role !== "teacher") return res.status(403).json({ error: "Forbidden" });
            const op = req.method === "POST" ? supabase.from("exam_results").upsert(req.body) : supabase.from("exam_results").update(req.body).eq("id", id);
            const { data, error } = await op.select();
            if (error) throw error;
            return res.json(data);
        }
    }

    const student_id = path; // Default path is usually the student_id
    if (req.method === "GET" && student_id) {
       let q = supabase.from("exams").select("*").eq("student_id", student_id);
       if (user.role === "teacher") {
          const { data: t } = await supabase.from("teachers").select("subjects").eq("user_id", user.id).single();
          if (t?.subjects) q = q.in("subject", t.subjects);
       }
       const { data, error } = await q.order("created_at", { ascending: false });
       if (error) throw error;
       return res.json(data);
    }

    if (req.method === "POST") {
        if (user.role !== "headteacher" && user.role !== "teacher") return res.status(403).json({ error: "Forbidden" });
        const { error } = await supabase.from("exams").insert(req.body);
        if (error) throw error;
        return res.json({ message: "Exam recorded" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
