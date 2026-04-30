import jwt from "jsonwebtoken";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { supabase } from "./supabase";

export const JWT_SECRET = process.env.JWT_SECRET || "changara-secret-key-123";

export interface AuthenticatedRequest extends VercelRequest {
  user?: {
    id: string;
    email: string;
    role: "headteacher" | "teacher" | "parent";
  };
}

export const authenticate = (req: AuthenticatedRequest, res: VercelResponse) => {
  const token = req.cookies.token;
  if (!token) {
    throw new Error("Unauthorized: Missing token");
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    return decoded;
  } catch (err: any) {
    throw new Error("Invalid token");
  }
};

export async function getFullUserProfile(user: any) {
  if (user.role === 'teacher') {
     const { data: teacherInfo } = await supabase.from("teachers").select("*").eq("user_id", user.id).single();
     return { ...user, teacherInfo };
  }

  if (user.role === 'parent') {
    const { data: parentLinks, error: parentError } = await supabase
      .from("parents")
      .select("student_id")
      .ilike("email", user.email);

    if (parentLinks && parentLinks.length > 0) {
      const studentId = parentLinks[0].student_id;
      const { data: student } = await supabase.from("students").select("*").eq("id", studentId).single();
      
      if (student) {
        const { data: fees } = await supabase.from("fees").select("*").eq("student_id", student.id);
        const { data: exams } = await supabase.from("exams").select("*").eq("student_id", student.id);
        const { data: announcements } = await supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(10);
        const { data: feeStructure } = await supabase.from("fee_structure").select("*").eq("class", student.class);
        
        return { 
          ...user, 
          parentInfo: { 
            student, 
            fees: fees || [], 
            exams: exams || [],
            announcements: announcements || [],
            feeStructure: feeStructure || []
          } 
        };
      }
    }
  }
  return user;
}
