
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
  upi_number?: string;
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
  class?: string;
  exam_type?: string;
  term: string;
  year: number;
  marks?: number;
  grade?: string;
  math_marks?: number;
  english_marks?: number;
  kiswahili_marks?: number;
  science_marks?: number;
  social_studies_marks?: number;
  creative_arts_marks?: number;
  religious_education_marks?: number;
  life_skills_marks?: number;
  physical_education_marks?: number;
  agriculture_marks?: number;
  remarks?: string;
  updated_at?: string;
}
