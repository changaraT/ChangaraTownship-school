
export type UserRole = 'headteacher' | 'teacher' | 'parent';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  teacherInfo?: {
    name: string;
    classes: string[];
    subjects: string[];
    assignments?: { class: string; subject: string }[];
    teacher_role?: 'Class Teacher' | 'Subject Teacher';
  };
}

export interface Student {
  id: number;
  admission_number: string;
  name: string;
  class: string;
  parent_name?: string;
  parent_email: string;
  parent_phone: string;
  status: 'active' | 'inactive';
  health_complications?: string;
  has_disability?: boolean;
}

export interface Teacher {
  id: number;
  email: string;
  name: string;
  classes: string[];
  subjects: string[];
  assignments?: { class: string; subject: string }[];
  teacher_role?: 'Class Teacher' | 'Subject Teacher';
}

export interface Fee {
  id: number;
  student_id: number;
  amount: number;
  term: string;
  status: 'paid' | 'pending' | 'partial';
  date: string;
  food_type?: string;
}

export interface ExamResult {
  id: number;
  student_id: number;
  subject: string;
  marks: number;
  grade: string;
  term: string;
  year: number;
}
