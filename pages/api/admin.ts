import { VercelRequest, VercelResponse } from "@vercel/node";
import { supabase } from "../../lib/server/supabase";
import { authenticate } from "../../lib/server/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;
  const path = Array.isArray(slug) ? slug[0] : (req.url?.split('?')[0].split('/').filter(Boolean).pop());

  if (path === "health") {
    return res.json({ status: "ok", mode: "admin-consolidated" });
  }

  try {
    const user = authenticate(req as any, res);
    if (user.role !== "headteacher") return res.status(403).json({ error: "Forbidden" });

    if (path === "stats") {
        const [students, teachers, parents, messages, fees, exams] = await Promise.all([
          supabase.from("students").select("id", { count: 'exact', head: true }),
          supabase.from("teachers").select("id", { count: 'exact', head: true }),
          supabase.from("users").select("id", { count: 'exact', head: true }).eq("role", "parent"),
          supabase.from("messages").select("id", { count: 'exact', head: true }),
          supabase.from("fees").select("amount, created_at, term"),
          supabase.from("exams").select("marks, term")
        ]);

        return res.json({
          students: students.count || 0,
          teachers: teachers.count || 0,
          parents: parents.count || 0,
          messages: messages.count || 0,
          totalFees: (fees.data || []).reduce((a, b) => a + Number(b.amount), 0),
          feeTrends: (fees.data || []).map(f => ({ date: new Date(f.created_at).toLocaleDateString(undefined, { month: 'short' }), amount: f.amount })),
          academicTrends: Object.values((exams.data || []).reduce((acc: any, curr: any) => {
              if (!acc[curr.term]) acc[curr.term] = { term: curr.term, avg: 0, count: 0 };
              acc[curr.term].avg += curr.marks; acc[curr.term].count += 1;
              return acc;
          }, {})).map((a: any) => ({ term: a.term, avg: Math.round(a.avg / (a.count || 1)) }))
        });
    }

    if (path === "parents") {
        const { data } = await supabase.from("users").select("id, email, role, created_at").eq("role", "parent").order("created_at", { ascending: false });
        return res.json(data);
    }

    return res.status(404).json({ error: "Admin endpoint not found" });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
}
