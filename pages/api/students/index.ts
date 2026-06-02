import type { NextApiResponse } from 'next';
import { supabase, getSupabaseAdmin } from "../../../lib/server/supabase";
import { authenticate, AuthenticatedRequest } from "../../../lib/server/auth";

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    try {
        const user = authenticate(req, res);

        // GET /api/students with pagination support
        if (req.method === "GET") {
            try {
                // Pagination parameters with security validation
                const page = Math.max(1, parseInt(req.query.page as string) || 1);
                const limit = Math.max(1, Math.min(parseInt(req.query.limit as string) || 10, 100));
                const offset = (page - 1) * limit;

                let countQuery = supabase.from("students").select("*", { count: "exact", head: true });
                let dataQuery = supabase.from("students").select("*").order("name").range(offset, offset + limit - 1);

                // Apply role-based filters (prevent N+1 queries by filtering at DB level)
                if (user.role === "teacher") {
                    const { data: teacher } = await supabase.from("teachers").select("classes").eq("user_id", user.id).single();
                    if (!teacher?.classes?.length) {
                        return res.json({ data: [], pagination: { page, limit, total: 0, totalPages: 0 } });
                    }
                    countQuery = countQuery.in("class", teacher.classes);
                    dataQuery = dataQuery.in("class", teacher.classes);
                }

                // Get total count
                const { count } = await countQuery;
                const totalCount = count || 0;
                const totalPages = Math.ceil(totalCount / limit);

                // Get paginated data
                const { data, error } = await dataQuery;
                if (error) throw error;

                return res.json({
                    data: data || [],
                    pagination: {
                        page,
                        limit,
                        total: totalCount,
                        totalPages,
                    },
                });
            } catch (error) {
                console.error("Students fetch error:", error);
                return res.status(500).json({ error: "Failed to fetch students" });
            }
        }

        // POST /api/students with input validation
        if (req.method === "POST") {
            if (user.role !== "headteacher" && user.role !== "teacher") return res.status(403).json({ error: "Forbidden" });

            // Input validation and sanitization
            try {
                const { admission_number, name, class: className, parents, upi_number, health_complications, has_disability } = req.body;

                // Validate required fields
                if (!admission_number || typeof admission_number !== "string" || admission_number.trim().length === 0) {
                    return res.status(400).json({ error: "Admission number is required" });
                }
                if (!name || typeof name !== "string" || name.trim().length === 0) {
                    return res.status(400).json({ error: "Student name is required" });
                }
                if (!className || typeof className !== "string" || className.trim().length === 0) {
                    return res.status(400).json({ error: "Class is required" });
                }

                // Sanitize string inputs (prevent XSS)
                const sanitizedAdmission = admission_number.trim().replace(/[<>\"']/g, "");
                const sanitizedName = name.trim().replace(/[<>\"']/g, "");
                const sanitizedClass = className.trim();
                const sanitizedComplications = health_complications ? String(health_complications).trim().replace(/[<>\"']/g, "") : "";
                const sanitizedUPI = upi_number ? String(upi_number).trim().replace(/[<>\"']/g, "") : "";

                // Validate admission number format (alphanumeric, -, /)
                if (!/^[A-Z0-9\/-]+$/i.test(sanitizedAdmission) || sanitizedAdmission.length > 50) {
                    return res.status(400).json({ error: "Invalid admission number format" });
                }

                // Validate name length
                if (sanitizedName.length < 2 || sanitizedName.length > 100) {
                    return res.status(400).json({ error: "Name must be 2-100 characters" });
                }

                // Check for duplicate admission number
                const { data: existingStudent } = await supabase.from("students").select("id").eq("admission_number", sanitizedAdmission).single();
                if (existingStudent) {
                    return res.status(409).json({ error: "Admission number already exists" });
                }

                // Insert student
                const { data: student, error } = await supabase.from("students").insert({
                    admission_number: sanitizedAdmission,
                    name: sanitizedName,
                    class: sanitizedClass,
                    upi_number: sanitizedUPI,
                    health_complications: sanitizedComplications,
                    has_disability: has_disability === true,
                    parent_name: parents?.[0]?.name ? String(parents[0].name).trim().replace(/[<>\"']/g, "") : null,
                    parent_email: parents?.[0]?.email ? String(parents[0].email).trim().toLowerCase() : null,
                    parent_phone: parents?.[0]?.phone ? String(parents[0].phone).trim() : null
                }).select().single();

                if (error) throw error;

                // Create parent accounts
                if (parents && Array.isArray(parents)) {
                    for (const p of parents) {
                        if (p.email) {
                            const lowerEmail = String(p.email).trim().toLowerCase();

                            // Validate email format
                            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lowerEmail)) {
                                console.warn(`Invalid email format for parent: ${lowerEmail}`);
                                continue;
                            }

                            // Validate phone if provided
                            if (p.phone && !/^\+254\d{9}$/.test(String(p.phone).trim())) {
                                console.warn(`Invalid phone format for parent: ${p.phone}`);
                                continue;
                            }

                            const { data: exists } = await supabase.from("users").select("id").eq("email", lowerEmail).single();

                            if (!exists) {
                                const adminSupabase = getSupabaseAdmin();
                                if (adminSupabase) {
                                    const { error: createError } = await adminSupabase.auth.admin.createUser({
                                        email: lowerEmail,
                                        password: sanitizedAdmission,
                                        user_metadata: { role: "parent" },
                                        email_confirm: true
                                    });
                                    if (createError && !createError.message.toLowerCase().includes("already")) {
                                        console.error("Failed to create parent user:", createError);
                                    }
                                } else {
                                    console.warn("Service role key not set, falling back to signUp.");
                                    const { error: signUpError } = await supabase.auth.signUp({
                                        email: lowerEmail,
                                        password: sanitizedAdmission,
                                        options: { data: { role: "parent" } }
                                    });
                                    if (signUpError && !signUpError.message.toLowerCase().includes("already")) {
                                        console.error("Failed to sign up parent:", signUpError);
                                    }
                                }
                            }

                            // Insert parent record
                            const parentName = p.name ? String(p.name).trim().replace(/[<>\"']/g, "") : "Parent";
                            await supabase.from("parents").insert({
                                name: parentName,
                                email: lowerEmail,
                                phone: p.phone ? String(p.phone).trim() : null,
                                student_id: student.id
                            }).catch(err => console.error("Failed to insert parent record:", err));
                        }
                    }
                }
                return res.json({ message: "Student admitted successfully", student });
            } catch (error) {
                console.error("Student creation error:", error);
                return res.status(400).json({ error: "Failed to admit student" });
            }
        }

        return res.status(405).json({ error: "Method not allowed" });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
}
