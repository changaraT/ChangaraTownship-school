import type { NextApiResponse } from 'next';
import { supabase } from "../../../lib/server/supabase";
import { authenticate, AuthenticatedRequest } from "../../../lib/server/auth";

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { slug } = req.query;
  const id = Array.isArray(slug) ? slug[0] : null;

  try {
    const user = authenticate(req, res);

    // POST /api/students/promote
    if (id === 'promote' && req.method === 'POST') {
      if (user.role !== 'headteacher') return res.status(403).json({ error: 'Forbidden' });
      const { className } = req.body;
      const promotionMap: Record<string, string> = {
        'Playgroup': 'PP1',
        'PP1': 'PP2',
        'PP2': 'Grade 1',
        'Grade 1': 'Grade 2',
        'Grade 2': 'Grade 3',
        'Grade 3': 'Grade 4',
        'Grade 4': 'Grade 5',
        'Grade 5': 'Grade 6',
        'Grade 6': 'Grade 7 (JSS)',
        'Grade 7 (JSS)': 'Grade 8 (JSS)',
        'Grade 8 (JSS)': 'Grade 9 (JSS)',
        'Grade 9 (JSS)': 'Graduated'
      };
      const nextClass = promotionMap[className];
      if (!nextClass) return res.status(400).json({ error: 'No promotion path configured for this class.' });

      // 1. Promote students to next class
      const { error: studentError } = await supabase.from('students').update({ class: nextClass }).eq('class', className);
      if (studentError) throw studentError;

      // 2. Update teacher class assignments when a class is promoted
      // Find all teachers with the current class in their classes array
      const { data: affectedTeachers, error: teacherFetchError } = await supabase
        .from('teachers')
        .select('id, classes')
        .contains('classes', [className]); // PostgreSQL array contains

      if (teacherFetchError) throw teacherFetchError;

      // Update each affected teacher's class assignment
      if (affectedTeachers && affectedTeachers.length > 0) {
        for (const teacher of affectedTeachers) {
          const updatedClasses = teacher.classes.map((c: string) => c === className ? nextClass : c);
          const { error: updateError } = await supabase
            .from('teachers')
            .update({ classes: updatedClasses })
            .eq('id', teacher.id);
          if (updateError) throw updateError;
        }
      }

      return res.json({
        from: className,
        to: nextClass,
        teachersUpdated: affectedTeachers?.length || 0
      });
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
