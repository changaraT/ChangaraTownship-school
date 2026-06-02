import type { NextApiResponse } from 'next';
import { supabase } from "../../../lib/server/supabase";
import { authenticate, AuthenticatedRequest } from "../../../lib/server/auth";

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    const { slug } = req.query;
    const path = Array.isArray(slug) ? slug.join('/') : slug;

    try {
        const user = authenticate(req, res);

        // /api/finance/structure
        if (path.startsWith('structure')) {
            const rawClassName = path.split('/')[1];
            const className = rawClassName ? decodeURIComponent(rawClassName) : '';
            if (req.method === "GET") {
                const { data, error } = await supabase.from("fee_structure").select("*").order("class");
                if (error) throw error;
                return res.json(data);
            }
            if (req.method === "POST") {
                if (user.role !== "headteacher") return res.status(403).json({ error: "Forbidden" });
                const { level, term1, term2, term3 } = req.body;
                const levelMap: any = { 'Foundation & Pre-Primary': ['Playgroup', 'PP1', 'PP2'], 'Lower/Upper Primary': ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'], 'Junior Secondary (JSS)': ['Grade 7', 'Grade 8', 'Grade 9'] };
                const classesToUpdate = (levelMap[level] || [level]);
                for (const className of classesToUpdate) {
                    await supabase.from("fee_structure").delete().eq("class", className);
                    await supabase.from("fee_structure").insert([
                        { class: className, term: 'Term 1', amount: parseFloat(term1) },
                        { class: className, term: 'Term 2', amount: parseFloat(term2) },
                        { class: className, term: 'Term 3', amount: parseFloat(term3) }
                    ]);
                }

                // Also create pending fee records for enrolled students (does not alter existing payments)
                try {
                    const year = new Date().getFullYear();
                    // For each class in the updated level, fetch students and create pending fee entries if missing
                    for (const className of classesToUpdate) {
                        const { data: students } = await supabase.from('students').select('id').eq('class', className);
                        const studentIds = (students || []).map((s: any) => s.id).filter(Boolean);
                        if (studentIds.length === 0) continue;

                        // Fetch existing fees for these students for this year
                        const { data: existingFees } = await supabase.from('fees').select('student_id,term,year').in('student_id', studentIds).eq('year', year);
                        const existingSet = new Set((existingFees || []).map((f: any) => `${f.student_id}::${f.term}::${f.year}`));

                        const inserts: any[] = [];
                        const terms = [['Term 1', parseFloat(term1)], ['Term 2', parseFloat(term2)], ['Term 3', parseFloat(term3)]];
                        for (const [termName, amount] of terms) {
                            for (const sid of studentIds) {
                                const key = `${sid}::${termName}::${year}`;
                                if (!existingSet.has(key)) {
                                    inserts.push({ student_id: sid, amount: amount || 0, term: termName, status: 'pending', date: new Date().toISOString(), year });
                                }
                            }
                        }

                        if (inserts.length > 0) {
                            // Insert in batches
                            const chunkSize = 200;
                            for (let i = 0; i < inserts.length; i += chunkSize) {
                                const chunk = inserts.slice(i, i + chunkSize);
                                await supabase.from('fees').insert(chunk);
                            }
                        }
                    }
                } catch (e) {
                    // Non-fatal: fee creation should not block structure update
                    console.error('Failed to auto-create pending fees:', e?.message || e);
                }
                return res.json({ message: "Structure updated" });
            }
            if (req.method === "DELETE" && className) {
                if (user.role !== "headteacher") return res.status(403).json({ error: "Forbidden" });
                try {
                    const { error } = await supabase.from("fee_structure").delete().eq("class", className);
                    if (error) throw error;
                    return res.json({ message: `Structure for ${className} deleted successfully` });
                } catch (e: any) {
                    console.error('Delete error:', e);
                    return res.status(400).json({ error: e.message || 'Failed to delete structure' });
                }
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
            const { data, error } = await supabase.from("fees").insert(req.body).select('*');
            if (error) throw error;
            return res.json({ data });
        }

        return res.status(405).json({ error: "Method not allowed" });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
}
