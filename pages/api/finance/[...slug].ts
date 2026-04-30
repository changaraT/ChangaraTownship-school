import { VercelResponse } from "@vercel/node";
import { supabase } from "../../../lib/server/supabase";
import { authenticate, AuthenticatedRequest } from "../../../lib/server/auth";

export default async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  const { slug } = req.query;
  const path = Array.isArray(slug) ? slug.join('/') : slug;

  try {
    const user = authenticate(req, res);

    // /api/finance/structure
    if (path.startsWith('structure')) {
        const className = path.split('/')[1];
        if (req.method === "GET") {
            const { data, error } = await supabase.from("fee_structure").select("*").order("class");
            if (error) throw error;
            return res.json(data);
        }
        if (req.method === "POST") {
            if (user.role !== "headteacher") return res.status(403).json({ error: "Forbidden" });
            const { level, term1, term2, term3 } = req.body;
            const levelMap: any = { 'Foundation & Pre-Primary': ['Playgroup', 'PP1', 'PP2'], 'Lower/Upper Primary': ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'], 'Junior Secondary (JSS)': ['Grade 7', 'Grade 8', 'Grade 9'] };
            for (const className of (levelMap[level] || [level])) {
                await supabase.from("fee_structure").delete().eq("class", className);
                await supabase.from("fee_structure").insert([{ class: className, term: 'Term 1', amount: parseFloat(term1) }, { class: className, term: 'Term 2', amount: parseFloat(term2) }, { class: className, term: 'Term 3', amount: parseFloat(term3) }]);
            }
            return res.json({ message: "Structure updated" });
        }
        if (req.method === "DELETE" && className) {
            if (user.role !== "headteacher") return res.status(403).json({ error: "Forbidden" });
            const { error } = await supabase.from("fee_structure").delete().eq("class", className);
            if (error) throw error;
            return res.json({ message: "Structure deleted" });
        }
    }

    // /api/finance/[student_id]
    if (req.method === "GET") {
        const { data, error } = await supabase.from("fees").select("*").eq("student_id", path);
        if (error) throw error;
        return res.json(data);
    }

    if (req.method === "POST") {
        if (user.role !== "headteacher") return res.status(403).json({ error: "Forbidden" });
        const { error } = await supabase.from("fees").insert(req.body);
        if (error) throw error;
        return res.json({ message: "Fee recorded" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
