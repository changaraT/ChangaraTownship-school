import { VercelResponse } from "@vercel/node";
import { supabase, getSupabaseAdmin } from "../../../lib/server/supabase";
import { authenticate, AuthenticatedRequest } from "../../../lib/server/auth";

export default async function handler(req: AuthenticatedRequest, res: VercelResponse) {
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
            const { admission_number, name, class: className, parents, upi_number, health_complications, has_disability } = req.body;
            const { data: student, error } = await supabase.from("students").insert({
                admission_number,
                name,
                class: className,
                upi_number,
                health_complications,
                has_disability,
                parent_name: parents?.[0]?.name,
                parent_email: parents?.[0]?.email,
                parent_phone: parents?.[0]?.phone
            }).select().single();
            if (error) throw error;

            if (parents && Array.isArray(parents)) {
                for (const p of parents) {
                    if (p.email) {
                        const lowerEmail = p.email.toLowerCase();
                        const { data: exists } = await supabase.from("users").select("id").eq("email", lowerEmail).single();

                        if (!exists) {
                            const adminSupabase = getSupabaseAdmin();
                            if (adminSupabase) {
                                const { error: createError } = await adminSupabase.auth.admin.createUser({
                                    email: lowerEmail,
                                    password: admission_number.toString(),
                                    user_metadata: { role: "parent" },
                                    email_confirm: true
                                });
                                if (createError && !createError.message.toLowerCase().includes("already")) {
                                    console.error("Failed to create parent user:", createError);
                                    throw createError;
                                }
                            } else {
                                console.warn("Service role key not set, falling back to signUp. Parent may need to confirm email.");
                                const { error: signUpError } = await supabase.auth.signUp({
                                    email: lowerEmail,
                                    password: admission_number.toString(),
                                    options: { data: { role: "parent" } }
                                });
                                if (signUpError && !signUpError.message.toLowerCase().includes("already")) {
                                    console.error("Failed to sign up parent:", signUpError);
                                    throw signUpError;
                                }
                            }
                        }

                        await supabase.from("parents").insert({ name: p.name || "Parent", email: lowerEmail, phone: p.phone, student_id: student.id });
                        console.log(`Parent created: ${p.name} (${lowerEmail}) for student ${student.id}`);
                    }
                }
            }
            return res.json({ message: "Student admitted", student });
        }

        return res.status(405).json({ error: "Method not allowed" });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
}
