import { VercelRequest, VercelResponse } from "@vercel/node";
import { supabase } from "../../../lib/server/supabase";
import { authenticate } from "../../../lib/server/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;
  const path = Array.isArray(slug) ? slug[0] : (req.url?.split('?')[0].split('/').filter(Boolean).pop());

  // Handle direct /api/admin calls (from rewrites)
  if (!path || path === 'admin') {
    // Check if this is a stats request by looking at the URL
    if (req.url?.includes('/stats') || req.url?.endsWith('/admin')) {
      // This is a stats request
    } else {
      return res.status(404).json({ error: "Admin endpoint not found" });
    }
  }

  if (path === "health") {
    return res.json({ status: "ok", mode: "admin-consolidated" });
  }

  try {
    const user = authenticate(req as any, res);
    if (user.role !== "headteacher") return res.status(403).json({ error: "Forbidden" });

    if (path === "stats" || req.url?.includes('/stats')) {
      try {
        // Get accurate counts from database
        const [studentsResult, teachersResult, parentsResult, messagesResult, feesResult, examsResult] = await Promise.all([
          supabase.from("students").select("id", { count: 'exact', head: true }),
          supabase.from("teachers").select("id", { count: 'exact', head: true }),
          supabase.from("users").select("id", { count: 'exact', head: true }).eq("role", "parent"),
          supabase.from("messages").select("id", { count: 'exact', head: true }),
          supabase.from("fees").select("amount, created_at, term"),
          supabase.from("exams").select("marks, term")
        ]);

        // Extract counts safely
        const studentCount = studentsResult.count ?? 0;
        const teacherCount = teachersResult.count ?? 0;
        const parentCount = parentsResult.count ?? 0;
        const messageCount = messagesResult.count ?? 0;

        // Calculate fees data
        const totalFees = (feesResult.data || []).reduce((sum, fee) => sum + (Number(fee.amount) || 0), 0);
        const feeTrends = (feesResult.data || [])
          .map(f => ({
            date: new Date(f.created_at).toLocaleDateString(undefined, { month: 'short' }),
            amount: Number(f.amount) || 0
          }))
          .slice(-10); // Last 10 entries

        // Calculate academic trends
        const academicTrendsMap: Record<string, { term: string, sum: number, count: number }> = {};
        (examsResult.data || []).forEach((exam: any) => {
          if (!academicTrendsMap[exam.term]) {
            academicTrendsMap[exam.term] = { term: exam.term, sum: 0, count: 0 };
          }
          academicTrendsMap[exam.term].sum += Number(exam.marks) || 0;
          academicTrendsMap[exam.term].count += 1;
        });

        const academicTrends = Object.values(academicTrendsMap)
          .map(t => ({
            term: t.term,
            avg: t.count > 0 ? Math.round(t.sum / t.count) : 0
          }))
          .sort((a, b) => {
            // Sort by term order
            const termOrder = { 'Term 1': 1, 'Term 2': 2, 'Term 3': 3 };
            return (termOrder[a.term as keyof typeof termOrder] || 0) - (termOrder[b.term as keyof typeof termOrder] || 0);
          });

        return res.json({
          students: studentCount,
          teachers: teacherCount,
          parents: parentCount,
          messages: messageCount,
          totalFees,
          feeTrends,
          academicTrends
        });
      } catch (statsError: any) {
        console.error("Stats calculation error:", statsError);
        return res.json({
          students: 0,
          teachers: 0,
          parents: 0,
          messages: 0,
          totalFees: 0,
          feeTrends: [],
          academicTrends: []
        });
      }
    }

    if (path === "parents") {
      const { data, error } = await supabase.from("parents").select("id, name, email, phone, student_id, created_at").order("created_at", { ascending: false });
      if (error) throw error;
      return res.json(data);
    }

    return res.status(404).json({ error: "Admin endpoint not found" });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
}
