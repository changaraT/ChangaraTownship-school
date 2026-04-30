-- SUPABASE "ULTIMATE FIX" SCHEMA
-- This script handles type mismatches and ensures all required tables exist.
-- WARNING: This will drop and recreate tables to ensure consistency.

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Clean up existing objects
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.announcements CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.exams CASCADE;
DROP TABLE IF EXISTS public.fees CASCADE;
DROP TABLE IF EXISTS public.parents CASCADE;
DROP TABLE IF EXISTS public.teachers CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.fee_structure CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 3. Create the Users table (Linked to Supabase Auth)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('headteacher', 'teacher', 'parent')) NOT NULL DEFAULT 'teacher',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3a. Auth Sync Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'role', 'teacher'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3b. Trigger to call function on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Students Table
CREATE TABLE public.students (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  admission_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  parent_name TEXT,
  parent_email TEXT,
  parent_phone TEXT,
  health_complications TEXT,
  has_disability BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Teachers Table
CREATE TABLE public.teachers (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  classes TEXT[], 
  subjects TEXT[],
  teacher_role TEXT CHECK (teacher_role IN ('Class Teacher', 'Subject Teacher')),
  assignments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Parents Table (Linked to Students)
CREATE TABLE public.parents (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  student_id BIGINT REFERENCES public.students(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Fees Table
CREATE TABLE public.fees (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  student_id BIGINT REFERENCES public.students(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  term TEXT NOT NULL,
  status TEXT CHECK (status IN ('paid', 'pending', 'partial')) NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Exams Table
CREATE TABLE public.exams (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  student_id BIGINT REFERENCES public.students(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  marks INTEGER NOT NULL,
  grade TEXT,
  term TEXT NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Announcements (Bulletins)
CREATE TABLE public.announcements (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT CHECK (type IN ('General', 'Alert', 'Event', 'Holiday')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Messages Table
CREATE TABLE public.messages (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  sender_id UUID REFERENCES public.users(id),
  receiver_type TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT CHECK (status IN ('sent', 'failed')) DEFAULT 'sent',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Fee Structure Table
CREATE TABLE public.fee_structure (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  class TEXT NOT NULL,
  term TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Enable Row Level Security (RLS) and set simple permissive policies for development
-- You can harden these later using the auth.uid() checks.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_structure ENABLE ROW LEVEL SECURITY;

-- Permissive policies for authenticated and anon users (Express server acts as gatekeeper)
CREATE POLICY "authenticated_access_users" ON public.users FOR ALL TO authenticated, anon USING (true);
CREATE POLICY "authenticated_access_students" ON public.students FOR ALL TO authenticated, anon USING (true);
CREATE POLICY "authenticated_access_teachers" ON public.teachers FOR ALL TO authenticated, anon USING (true);
CREATE POLICY "authenticated_access_parents" ON public.parents FOR ALL TO authenticated, anon USING (true);
CREATE POLICY "authenticated_access_fees" ON public.fees FOR ALL TO authenticated, anon USING (true);
CREATE POLICY "authenticated_access_exams" ON public.exams FOR ALL TO authenticated, anon USING (true);
CREATE POLICY "authenticated_access_announcements" ON public.announcements FOR ALL TO authenticated, anon USING (true);
CREATE POLICY "authenticated_access_messages" ON public.messages FOR ALL TO authenticated, anon USING (true);
CREATE POLICY "authenticated_access_fee_structure" ON public.fee_structure FOR ALL TO authenticated, anon USING (true);

-- Public access policies for the public dashboards
CREATE POLICY "public_view_announcements" ON public.announcements FOR SELECT TO anon USING (true);
CREATE POLICY "public_view_students" ON public.students FOR SELECT TO anon USING (true);
CREATE POLICY "public_view_fees" ON public.fees FOR SELECT TO anon USING (true);
CREATE POLICY "public_view_exams" ON public.exams FOR SELECT TO anon USING (true);
