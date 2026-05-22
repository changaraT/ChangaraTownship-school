import jwt from "jsonwebtoken";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { supabase } from "./supabase";
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

export const JWT_SECRET = process.env.JWT_SECRET || "changara-secret-key-123";

export interface AuthenticatedRequest extends VercelRequest {
  user?: {
    id: string;
    email: string;
    role: "headteacher" | "teacher" | "parent";
  };
}

export const authenticate = (req: AuthenticatedRequest, _res: VercelResponse) => {
  // Try to get token from cookies
  let token = req.cookies?.token;

  // If not in cookies, try to parse from cookie header
  if (!token && req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    token = cookies.token;
  }

  if (!token) {
    console.error("No token found in request");
    throw new Error("Unauthorized: Missing token");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    return decoded;
  } catch (err: any) {
    console.error("JWT verification error:", err.message, "JWT_SECRET length:", JWT_SECRET?.length);
    throw new Error("Invalid token");
  }
};;

export async function getFullUserProfile(user: any) {
  if (user.role === "teacher") {
    const { data: teacherInfo } = await supabase.from("teachers").select("*").eq("user_id", user.id).single();
    return { ...user, teacherInfo };
  }

  if (user.role === "parent") {
    const { data: parentLinks } = await supabase
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

        // Normalize feeStructure rows to include a year so frontend can easily match by year
        const normalizedFeeStructure = (feeStructure || []).map((s: any) => ({ ...s, year: s.year || new Date().getFullYear() }));

        // Compute expected fees up to current term and current year
        const month = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const termOrder = ['Term 1', 'Term 2', 'Term 3'];
        const currentTermIndex = month <= 4 ? 0 : month <= 8 ? 1 : 2;
        const termsToInclude = termOrder.slice(0, currentTermIndex + 1);

        const getStructureAmount = (termName: string) => {
          const row = normalizedFeeStructure.find((r: any) => r.term === termName && Number(r.year) === Number(currentYear));
          if (row && row.amount != null) return Number(row.amount || 0);
          // fallback: use first available amount for the class
          const anyRow = normalizedFeeStructure.find((r: any) => r.amount != null);
          return anyRow ? Number(anyRow.amount || 0) : 0;
        };

        const breakdown = termsToInclude.map((t) => {
          const expectedAmount = getStructureAmount(t);
          const paidAmount = (fees || []).filter((f: any) => {
            const feeYear = f.year || (f.date ? new Date(f.date).getFullYear() : currentYear);
            return String(f.term) === String(t) && Number(feeYear) === Number(currentYear) && String((f.status || '').toString()).toLowerCase() === 'paid';
          }).reduce((s: number, f: any) => s + Number(f.amount || 0), 0);
          return { term: t, expectedAmount, paidAmount };
        });

        const expectedTotal = breakdown.reduce((s: number, b: any) => s + Number(b.expectedAmount || 0), 0);
        const paidTotal = breakdown.reduce((s: number, b: any) => s + Number(b.paidAmount || 0), 0);
        const balance = Math.max(0, expectedTotal - paidTotal);

        return {
          ...user,
          parentInfo: {
            student,
            fees: fees || [],
            exams: exams || [],
            announcements: announcements || [],
            feeStructure: normalizedFeeStructure,
            financial: { termsIncluded: termsToInclude, expectedTotal, paidTotal, balance, breakdown }
          },
        };
      }
    }
  }

  // Fallback: if a user has an email that matches a student's parent_email, expose student view
  try {
    const { data: matchedStudent } = await supabase.from('students').select('*').ilike('parent_email', user.email).maybeSingle();
    if (matchedStudent) {
      const { data: fees } = await supabase.from('fees').select('*').eq('student_id', matchedStudent.id);
      const { data: exams } = await supabase.from('exams').select('*').eq('student_id', matchedStudent.id);
      const { data: announcements } = await supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(10);
      const { data: feeStructure } = await supabase.from('fee_structure').select('*').eq('class', matchedStudent.class);
      const normalizedFeeStructure = (feeStructure || []).map((s: any) => ({ ...s, year: s.year || new Date().getFullYear() }));

      // Compute expected fees up to current term and current year (same logic as above)
      const month = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const termOrder = ['Term 1', 'Term 2', 'Term 3'];
      const currentTermIndex = month <= 4 ? 0 : month <= 8 ? 1 : 2;
      const termsToInclude = termOrder.slice(0, currentTermIndex + 1);

      const getStructureAmount = (termName: string) => {
        const row = normalizedFeeStructure.find((r: any) => r.term === termName && Number(r.year) === Number(currentYear));
        if (row && row.amount != null) return Number(row.amount || 0);
        const anyRow = normalizedFeeStructure.find((r: any) => r.amount != null);
        return anyRow ? Number(anyRow.amount || 0) : 0;
      };

      const breakdown = termsToInclude.map((t) => {
        const expectedAmount = getStructureAmount(t);
        const paidAmount = (fees || []).filter((f: any) => {
          const feeYear = f.year || (f.date ? new Date(f.date).getFullYear() : currentYear);
          return String(f.term) === String(t) && Number(feeYear) === Number(currentYear) && String((f.status || '').toString()).toLowerCase() === 'paid';
        }).reduce((s: number, f: any) => s + Number(f.amount || 0), 0);
        return { term: t, expectedAmount, paidAmount };
      });

      const expectedTotal = breakdown.reduce((s: number, b: any) => s + Number(b.expectedAmount || 0), 0);
      const paidTotal = breakdown.reduce((s: number, b: any) => s + Number(b.paidAmount || 0), 0);
      const balance = Math.max(0, expectedTotal - paidTotal);

      return {
        ...user,
        parentInfo: {
          student: matchedStudent,
          fees: fees || [],
          exams: exams || [],
          announcements: announcements || [],
          feeStructure: normalizedFeeStructure,
          financial: { termsIncluded: termsToInclude, expectedTotal, paidTotal, balance, breakdown }
        }
      };
    }
  } catch (e) {
    // ignore fallback errors
  }
  return user;
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string) {
  try {
    const [salt, key] = stored.split(':');
    if (!salt || !key) return false;
    const derived = scryptSync(password, salt, 64);
    const keyBuf = Buffer.from(key, 'hex');
    return timingSafeEqual(keyBuf, derived);
  } catch (e) {
    return false;
  }
}
