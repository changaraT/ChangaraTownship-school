import type { NextApiResponse } from 'next';
import { supabase, getSupabaseAdmin } from "../../../lib/server/supabase";
import { authenticate, AuthenticatedRequest } from "../../../lib/server/auth";
import { sendEmail } from "../../../lib/server/mail";
import { randomUUID } from 'crypto';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
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

      // Get teachers with their email from users table, handling cases where user might not exist
      const { data: teachers, error: teachersError } = await supabase.from("teachers").select("*");
      if (teachersError) throw teachersError;

      // Fetch user emails separately
      const { data: users } = await supabase.from("users").select("id, email");
      const emailMap = new Map(users?.map(u => [u.id, u.email]) || []);

      // Merge teacher data with emails
      const teachersList = teachers?.map(t => ({
        ...t,
        email: emailMap.get(t.user_id) || 'N/A'
      })) || [];

      return res.json(teachersList);
    }

    if (req.method === "POST") {
      const { email, password, name, assignments, teacher_role, localAuth } = req.body;

      // If headteacher wants to provision local credentials (no Supabase email flow)
      if (localAuth) {
        // create a local user id and store a password hash in public.users
        const { hashPassword } = await import('../../../lib/server/auth');
        const userId = randomUUID();
        const password_hash = hashPassword(password || Math.random().toString(36).slice(-8));

        const classes = Array.from(new Set((assignments || []).map((a: any) => a.class)));
        const subjects = Array.from(new Set((assignments || []).map((a: any) => a.subject)));

        const { error: userErr } = await supabase.from('users').insert({
          id: userId,
          email: email.toLowerCase(),
          role: 'teacher',
          password_hash,
          created_at: new Date().toISOString()
        });
        if (userErr) throw userErr;

        const { error: teacherErr } = await supabase.from('teachers').insert({
          user_id: userId,
          name,
          classes,
          subjects,
          assignments: assignments || [],
          teacher_role: teacher_role || 'Subject Teacher'
        });
        if (teacherErr) throw teacherErr;

        // No email sent for local auth to avoid verification flow
        return res.json({ message: 'Teacher created (local credentials)' });
      }

      // Prefer service-role admin client to create users and perform inserts server-side
      const admin = getSupabaseAdmin();

      let userId: string | null = null;

      if (admin) {
        // Use admin API to create user reliably
        const { data: userData, error: createErr } = await admin.auth.admin.createUser({
          email: email.toLowerCase(),
          password,
          user_metadata: { role: 'teacher' }
        });
        if (createErr) throw createErr;
        userId = userData?.user?.id || userData?.id;

        if (!userId) throw new Error('Failed to create auth user');

        const classes = Array.from(new Set(assignments.map((a: any) => a.class)));
        const subjects = Array.from(new Set(assignments.map((a: any) => a.subject)));

        // Insert profile and teacher record using admin client to bypass RLS
        const { error: userInsertErr } = await admin.from('users').insert({
          id: userId,
          email: email.toLowerCase(),
          role: 'teacher',
          created_at: new Date().toISOString()
        });
        if (userInsertErr) {
          // Allow duplicate insert to pass on retries
          if (!userInsertErr.message?.includes('duplicate')) throw userInsertErr;
        }

        const { error: teacherInsertErr } = await admin.from('teachers').insert({
          user_id: userId,
          name,
          classes,
          subjects,
          assignments,
          teacher_role: teacher_role || 'Subject Teacher'
        });
        if (teacherInsertErr) throw teacherInsertErr;

      } else {
        // Fallback to legacy anon client if admin client not available
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email.toLowerCase(), password, options: { data: { role: "teacher" } }
        });
        if (authError || !authData?.user) throw authError || new Error("Failed to create user");
        userId = authData.user.id;

        const classes = Array.from(new Set(assignments.map((a: any) => a.class)));
        const subjects = Array.from(new Set(assignments.map((a: any) => a.subject)));

        const { error: userError } = await supabase.from("users").insert({
          id: userId,
          email: email.toLowerCase(),
          role: "teacher",
          created_at: new Date().toISOString()
        });
        if (userError) {
          if (!userError.message?.includes("duplicate")) throw userError;
        }

        const { error } = await supabase.from("teachers").insert({
          user_id: userId, name, classes, subjects, assignments, teacher_role: teacher_role || "Subject Teacher"
        });
        if (error) throw error;
      }

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
