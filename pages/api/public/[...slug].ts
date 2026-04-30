import { VercelRequest, VercelResponse } from "@vercel/node";
import { supabase } from "../_utils/supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;
  const action = Array.isArray(slug) ? slug[0] : slug;

  try {
    if (action === "student-count") {
      try {
        const { count } = await supabase.from("students").select("id", { count: "exact", head: true });
        return res.json({ totalStudents: count || 0 });
      } catch {
        // Keep landing page usable when Supabase env vars are not set locally.
        return res.json({ totalStudents: 0 });
      }
    }
    if (action === "announcements") {
      const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
      return res.json(data);
    }
    if (action === "student-access" && req.method === "POST") {
      const { admission_number } = req.body;
      const { data: student } = await supabase.from("students").select("*").eq("admission_number", admission_number).single();
      if (!student) return res.status(404).json({ error: "Not found" });
      const [fees, exams, ann] = await Promise.all([
          supabase.from("fees").select("*").eq("student_id", student.id),
          supabase.from("exams").select("*").eq("student_id", student.id),
          supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(10)
      ]);
      return res.json({ student, fees: fees.data, exams: exams.data, announcements: ann.data });
    }
    return res.status(404).json({ error: "Not found" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
