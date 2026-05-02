
import { useState, useEffect, createContext, useContext, Fragment, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  BookOpen,
  CreditCard,
  MessageSquare,
  LogOut,
  Plus,
  Search,
  School,
  ChevronRight,
  ChevronLeft,
  UserCheck,
  Send,
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
  LayoutDashboard,
  UserSquare,
  BookMarked,
  Wallet,
  TrendingUp,
  Mail,
  Menu,
  X,
  Printer,
  Download,
  Calendar,
  Settings,
  ArrowUpRight,
  Target,
  Compass,
  ArrowLeft,
  XCircle,
  Twitter,
  Facebook,
  Instagram,
  Bell,
  CalendarDays,
  Home,
  Power,
  Trophy,
  Trash2,
  Pencil,
  FileText,
  Edit,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ShieldOff,
  ShieldAlert,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from './motion-shim';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { User, Student, Teacher, Fee, ExamResult } from './types.ts';

const CBC_SUBJECTS = [
  { key: 'math_marks', label: 'Mathematics' },
  { key: 'english_marks', label: 'English Language' },
  { key: 'kiswahili_marks', label: 'Kiswahili Language' },
  { key: 'science_marks', label: 'Science' },
  { key: 'social_studies_marks', label: 'Social Studies' },
  { key: 'creative_arts_marks', label: 'Creative Arts' },
  { key: 'religious_education_marks', label: 'Religious Education' },
  { key: 'life_skills_marks', label: 'Life Skills' },
  { key: 'physical_education_marks', label: 'Physical Education' },
  { key: 'agriculture_marks', label: 'Agriculture' }
];

const CLASS_CBC_SUBJECT_KEYS_MAP: Record<string, string[]> = {
  Playgroup: ['math_marks', 'english_marks', 'kiswahili_marks', 'science_marks', 'social_studies_marks', 'creative_arts_marks', 'religious_education_marks', 'life_skills_marks', 'physical_education_marks'],
  PP1: ['math_marks', 'english_marks', 'kiswahili_marks', 'science_marks', 'social_studies_marks', 'creative_arts_marks', 'religious_education_marks', 'life_skills_marks', 'physical_education_marks'],
  PP2: ['math_marks', 'english_marks', 'kiswahili_marks', 'science_marks', 'social_studies_marks', 'creative_arts_marks', 'religious_education_marks', 'life_skills_marks', 'physical_education_marks'],
  'Grade 1': CBC_SUBJECTS.map((subject) => subject.key),
  'Grade 2': CBC_SUBJECTS.map((subject) => subject.key),
  'Grade 3': CBC_SUBJECTS.map((subject) => subject.key),
  'Grade 4': CBC_SUBJECTS.map((subject) => subject.key),
  'Grade 5': CBC_SUBJECTS.map((subject) => subject.key),
  'Grade 6': CBC_SUBJECTS.map((subject) => subject.key),
  'Grade 7 (JSS)': CBC_SUBJECTS.map((subject) => subject.key),
  'Grade 8 (JSS)': CBC_SUBJECTS.map((subject) => subject.key),
  'Grade 9 (JSS)': CBC_SUBJECTS.map((subject) => subject.key),
};

const getExamSubjectsForClass = (className: string) => {
  const keys = CLASS_CBC_SUBJECT_KEYS_MAP[className] || CBC_SUBJECTS.map((subject) => subject.key);
  return CBC_SUBJECTS.filter((subject) => keys.includes(subject.key));
};

const getCurrentAcademicTerm = (date = new Date()) => {
  const month = date.getMonth() + 1;
  if (month >= 1 && month <= 4) return 'Term 1';
  if (month >= 5 && month <= 8) return 'Term 2';
  return 'Term 3';
};

const getCurrentAcademicYear = (date = new Date()) => date.getFullYear().toString();

const getFormattedToday = (date = new Date()) => date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

/** Utility for Tailwind classes */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) setUser(await res.json());
      else setUser(null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { checkAuth(); }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid credentials');
    setUser(data);
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// --- UI Components ---
const Button = ({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className={cn(
      "px-4 py-2 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
      className
    )}
  />
);

const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={cn(
      "w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all",
      className
    )}
  />
);

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden", className)}>
    {children}
  </div>
);

// --- Pages ---

// Professional Landing Page for Changara Township School
const LandingPage = ({ onGoToLogin }: { onGoToLogin: () => void }) => {
  const [studentCount, setStudentCount] = useState<number | null>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    const fetchStudentCount = async () => {
      try {
        const res = await fetch('/api/public/student-count', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setStudentCount(data.totalStudents);
        }
      } catch (err) {
        console.error('Failed to fetch student count', err);
      }
    };

    const fetchAnnouncements = async () => {
      try {
        const res = await fetch('/api/public/announcements', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setAnnouncements(data);
        }
      } catch (err) {
        console.error('Failed to fetch announcements:', err);
      }
    };

    fetchStudentCount();
    fetchAnnouncements();
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-900 rounded-xl flex items-center justify-center text-white shadow-xl">
              <School size={22} />
            </div>
            <div className="hidden sm:block leading-none">
              <span className="font-black text-[13px] uppercase tracking-tighter block">Changara Township</span>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Excellence in every step</span>
            </div>
          </div>
          <button
            onClick={onGoToLogin}
            className="px-8 py-3 bg-emerald-900 text-white rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-900/10 active:scale-95"
          >
            Access Portal
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-48 pb-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-emerald-50 rounded-full blur-[120px] -mr-96 -mt-96 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-50 rounded-full blur-[100px] -ml-40 -mb-40 opacity-40"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 text-center lg:text-left">
          <div className="max-w-4xl mx-auto lg:mx-0 space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-5 py-2 bg-emerald-50/50 rounded-full border border-emerald-100 backdrop-blur-sm"
            >
              <div className="flex -space-x-1">
                {[1, 2, 3].map(i => <div key={i} className="w-5 h-5 rounded-full bg-emerald-200 border-2 border-white"></div>)}
              </div>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Nurturing potential since 2025</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-7xl lg:text-9xl font-black tracking-tighter leading-[0.85] text-slate-900"
            >
              Cultivating the <br /><span className="text-emerald-700">Architects</span> of Tomorrow.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl lg:text-2xl text-slate-500 font-medium italic max-w-2xl leading-relaxed mx-auto lg:mx-0"
            >
              "Excellence in Every Step" — We provide a premier learning environment focused on academic distinction, digital literacy, and character development.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-8 pt-4"
            >
              <button
                onClick={onGoToLogin}
                className="px-12 py-6 bg-emerald-900 text-white rounded-[2rem] font-black text-[13px] uppercase tracking-widest hover:bg-black shadow-2xl shadow-emerald-900/20 transition-all flex items-center gap-4 group active:scale-95"
              >
                Enter Portal <ArrowUpRight size={22} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
              <div className="px-10 py-6 border border-slate-100 rounded-[2rem] bg-white/50 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <p className="text-sm font-black text-slate-900 leading-none">{studentCount !== null ? studentCount.toLocaleString() : "0"}+</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Active Learners</p>
                  </div>
                  <div className="w-px h-8 bg-slate-100"></div>
                  <div className="text-left">
                    <p className="text-sm font-black text-emerald-600 leading-none">98.4%</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Pass Coefficient</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Vision & Mission Sections */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
            {/* Vision Card */}
            <div className="group relative bg-[#0a261d] p-16 lg:p-24 rounded-[4rem] shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 p-12 text-white/5 group-hover:text-amber-500/10 transition-colors duration-1000">
                <Target size={240} strokeWidth={1} />
              </div>
              <div className="relative z-10 space-y-8">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                  <Target size={24} />
                </div>
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em]">Our Vision</p>
                <h3 className="text-5xl lg:text-6xl font-black tracking-tight text-white leading-[0.9]">Pioneering global academic <span className="text-emerald-400">transformation</span>.</h3>
                <p className="text-xl text-slate-400 font-medium leading-relaxed italic border-l-2 border-emerald-500/30 pl-8">
                  To be a leading center of excellence that fosters holistic development, innovation, and ethical leadership in every student.
                </p>
              </div>
            </div>

            {/* Mission Card */}
            <div className="group relative bg-white p-16 lg:p-24 rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden">
              <div className="absolute top-0 right-0 p-12 text-slate-50 group-hover:text-emerald-50 transition-colors duration-1000">
                <Compass size={240} strokeWidth={1} />
              </div>
              <div className="relative z-10 space-y-8">
                <div className="w-12 h-12 bg-emerald-900 rounded-2xl flex items-center justify-center text-white">
                  <Compass size={24} />
                </div>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em]">Our Mission</p>
                <h3 className="text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[0.9]">Empowering minds through <span className="text-emerald-600">integrity</span>.</h3>
                <p className="text-xl text-slate-500 font-medium leading-relaxed italic border-l-2 border-slate-100 pl-8">
                  To provide a high-caliber education that promotes academic rigor, social responsibility, and creative critical thinking for sustainable impact.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Quote */}
      <section className="py-24 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-[1.1]">
            "Education is the most powerful weapon which you can use to change the world."
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <div className="w-16 h-1 bg-emerald-600 rounded-full"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Institutional Heritage</p>
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-[1.1] mb-6">
              Latest <span className="text-emerald-600">Announcements</span>
            </h2>
            <p className="text-xl text-slate-500 font-medium italic max-w-2xl mx-auto">
              Stay informed with the latest updates, events, and important notices from Changara Township School.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {announcements.slice(0, 6).map((ann: any) => (
              <Card key={ann.id} className="p-8 bg-white border border-slate-100 shadow-xl rounded-[2.5rem] group hover:shadow-2xl transition-all">
                <div className="flex items-center gap-4 mb-6">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center text-white",
                    ann.type === 'Alert' ? "bg-rose-500" : ann.type === 'Holiday' ? "bg-amber-500" : "bg-indigo-500"
                  )}>
                    <Bell size={20} />
                  </div>
                  <div>
                    <span className="text-[9px] font-black bg-slate-50 text-slate-400 px-3 py-1 rounded-full uppercase tracking-widest mb-2 inline-block">
                      {ann.type}
                    </span>
                    <p className="text-[10px] font-bold text-slate-400 italic">{new Date(ann.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <h4 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-4">{ann.title}</h4>
                <p className="text-slate-600 leading-relaxed font-medium text-sm line-clamp-3">{ann.content}</p>
              </Card>
            ))}
            {announcements.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <Bell size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 font-black italic tracking-tight text-xl">No announcements at this time.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-12 lg:gap-24">
            <div className="space-y-6 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-4">
                <div className="w-10 h-10 bg-emerald-900 rounded-xl flex items-center justify-center text-white">
                  <School size={20} />
                </div>
                <span className="font-black text-sm uppercase tracking-tighter">Changara Township School</span>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] max-w-sm">
                Excellence in every step. Empowering learners for a digital future through dedicated CBC implementation.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-16">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Connect</p>
                <ul className="space-y-2 text-xs font-bold text-slate-500">
                  <li className="hover:text-emerald-600 cursor-pointer">Official Portal</li>
                  <li className="hover:text-emerald-600 cursor-pointer">School Registry</li>
                  <li className="hover:text-emerald-600 cursor-pointer">Faculty Hub</li>
                </ul>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Support</p>
                <ul className="space-y-2 text-xs font-bold text-slate-500">
                  <li className="hover:text-emerald-600 cursor-pointer">Help Center</li>
                  <li className="hover:text-emerald-600 cursor-pointer">Safety Protocol</li>
                  <li className="hover:text-emerald-600 cursor-pointer">Privacy Policy</li>
                </ul>
              </div>
              <div className="space-y-4 text-center lg:text-left">
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest italic">Node Status</p>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[9px] font-black uppercase tracking-widest">Infrastructure Online</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-20 pt-10 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex gap-6 order-2 md:order-1">
              {[
                { icon: Twitter, label: 'Twitter' },
                { icon: Facebook, label: 'Facebook' },
                { icon: Instagram, label: 'Instagram' }
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="text-slate-400 hover:text-emerald-600 cursor-pointer transition-colors" title={label}>
                  <Icon size={18} />
                </span>
              ))}
            </div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center order-1 md:order-2 flex-grow">© 2026 Changara Township • Built for Digital Excellence</p>
            <div className="hidden md:block w-[120px] order-3"></div> {/* Spacer to help centering */}
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- Pages ---

// --- Pages ---

// Unified Auth Page (Login/Signup/Parent Access)
const AuthPage = ({ onBack }: { onBack: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (email !== "changaratownship@gmail.com") {
      setError("Only authorized email can register as Headteacher through this portal.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, role: 'headteacher' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess("Success! Proof of authorization recorded. Please check your email inbox to confirm your account before logging in.");
      setMode('login');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-3xl -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-50 rounded-full blur-3xl -ml-48 -mb-48"></div>

      <button
        onClick={onBack}
        className="fixed top-10 left-10 flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest transition-all group z-20"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Exit to Website
      </button>

      <div className="w-full max-w-[460px] space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-slate-900 text-white rounded-[2rem] mx-auto flex items-center justify-center shadow-2xl relative">
            <School size={36} />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Institutional Portal</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Changara Township • Professional Access</p>
          </div>
        </div>

        <Card className="bg-white border-slate-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] rounded-[3rem] p-12 lg:p-14 border-none">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {mode === 'login' ? 'Administrative Login' : 'Headteacher Registration'}
            </h2>
            <p className="text-slate-400 text-xs mt-1 font-medium italic">
              {mode === 'login' ? 'Synchronized authentication active.' : 'Restricted to authorized personnel.'}
            </p>
          </div>

          <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
              <Input type="email" placeholder="name@changara.edu" value={email} onChange={e => setEmail(e.target.value)} required className="h-12 bg-slate-50/50 border-slate-100 rounded-xl font-bold" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-end pr-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Password</label>
                {mode === 'login' && <button type="button" className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">Forgot?</button>}
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="h-12 bg-slate-50/50 border-slate-100 rounded-xl font-bold pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {error && <p className="text-red-500 text-[11px] font-bold bg-red-50 p-4 rounded-xl border border-red-100">{error}</p>}
            {success && <p className="text-emerald-500 text-[11px] font-bold bg-emerald-50 p-4 rounded-xl border border-emerald-100">{success}</p>}

            <Button disabled={loading} className="w-full bg-slate-900 text-white h-14 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black shadow-xl transition-all">
              {loading ? <Loader2 className="animate-spin mx-auto" /> : (mode === 'login' ? 'Sign In to Portal' : 'Register Account')}
            </Button>

            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="w-full py-4 text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors"
            >
              {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50 text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">
              Institutional security protocol active.<br />All access attempts are logged and audited.
            </p>
          </div>
        </Card>

        <p className="text-center text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em]">
          &copy; {new Date().getFullYear()} Changara Township SMS <span className="mx-2 opacity-50">|</span> Digital CBC Legacy
        </p>
      </div>
    </div>
  );
};

// --- Academics Parent View ---
const AcademicsParentView = ({ data }: { data: any }) => {
  const [year, setYear] = useState('2026');
  const [term, setTerm] = useState('Term 1');
  const [examType, setExamType] = useState('End Term');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/exam-results?studentId=${data.student.id}&term=${encodeURIComponent(term)}&year=${year}&examType=${encodeURIComponent(examType)}`, { credentials: 'include' });
      if (res.ok) {
        setResults(await res.json());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [term, year, examType]);

  const result = results[0]; // Since it filters by studentId, term, year, examType it should be 1 record with all subjects

  const subjects = [
    { key: 'math_marks', label: 'Mathematics' },
    { key: 'english_marks', label: 'English Language' },
    { key: 'kiswahili_marks', label: 'Kiswahili Language' },
    { key: 'science_marks', label: 'Science & Art' }
  ];

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter">Academic Portal</h2>
          <p className="text-slate-500 font-medium italic">Track competency progression and results for {data.student.name}</p>
        </div>
        <div className="flex flex-wrap bg-slate-100 p-2 rounded-2xl gap-2 w-full md:w-auto">
          <select
            value={examType}
            onChange={e => setExamType(e.target.value)}
            className="bg-white border-none rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none shadow-sm cursor-pointer"
          >
            <option value="Beginning of Term">Beginning of Term</option>
            <option value="Mid Term">Mid Term Assessment</option>
            <option value="End Term">End Term Exams</option>
          </select>
          <select
            value={year}
            onChange={e => setYear(e.target.value)}
            className="bg-white border-none rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none shadow-sm cursor-pointer"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
          <select
            value={term}
            onChange={e => setTerm(e.target.value)}
            className="bg-white border-none rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none shadow-sm cursor-pointer"
          >
            <option value="Term 1">Term 1</option>
            <option value="Term 2">Term 2</option>
            <option value="Term 3">Term 3</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-10 bg-white border border-slate-100 shadow-2xl rounded-[3.5rem] space-y-10">
            <div className="flex items-center gap-4 border-b border-slate-50 pb-8">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                <GraduationCap size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Competency Mastery</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{examType} | {term} - {year}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? (
                <div className="col-span-2 py-20 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>
              ) : !result ? (
                <div className="col-span-2 py-20 text-center opacity-30 flex flex-col items-center gap-4">
                  <Target size={40} />
                  <p className="font-bold italic">Academic records for this assessment cycle have not been ratified by the class teacher.</p>
                </div>
              ) : (
                subjects.map((sub) => {
                  const marks = result[sub.key];
                  if (marks === undefined || marks === null) return null;
                  const label = marks >= 80 ? 'EE' : marks >= 60 ? 'ME' : marks >= 40 ? 'AE' : 'BE';
                  const detailedLabel = marks >= 80 ? 'Exceeding Expectation' : marks >= 60 ? 'Meeting Expectation' : marks >= 40 ? 'Approaching Expectation' : 'Below Expectation';
                  const colorClass = marks >= 80 ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : marks >= 60 ? 'text-indigo-600 bg-indigo-50 border-indigo-100' : marks >= 40 ? 'text-amber-600 bg-amber-50 border-amber-100' : 'text-rose-600 bg-rose-50 border-rose-100';

                  return (
                    <div key={sub.key} className="flex justify-between items-center p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:bg-white hover:shadow-2xl transition-all group relative overflow-hidden">
                      <div className="relative z-10">
                        <p className="font-black text-slate-800 text-xl leading-none tracking-tight mb-2">{sub.label}</p>
                        <div className={cn("inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest", colorClass)}>
                          <div className={cn("w-2 h-2 rounded-full", marks >= 80 ? "bg-emerald-500" : marks >= 60 ? "bg-indigo-500" : marks >= 40 ? "bg-amber-500" : "bg-rose-500")}></div>
                          {detailedLabel}
                        </div>
                      </div>
                      <div className="relative z-10 text-right">
                        <p className="text-5xl font-black text-slate-900 tracking-tighter leading-none group-hover:scale-110 transition-transform origin-right">{label}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 italic">CBC Matrix v2</p>
                      </div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100/50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-50/50 transition-colors"></div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {result && (
            <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100 flex items-start gap-6">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm flex-shrink-0">
                <ShieldAlert size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-amber-900 uppercase tracking-widest leading-none">Parental Compliance Advisory</p>
                <p className="text-[11px] text-amber-700 italic font-medium leading-relaxed">Official transcripts are verified by the Institutional Academic Board. Discrepancies should be petitioned via the Class Facilitator's office within 48 hours of publication.</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-10">
          <Card className="p-10 bg-slate-900 text-white rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform"></div>
            <div className="space-y-8 relative z-10">
              <div className="flex items-center gap-4 border-b border-white/10 pb-8">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">Lead Evaluator</h3>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic tracking-tight">Qualitative Commentary</p>
                </div>
              </div>
              <div className="p-10 bg-white/5 rounded-[2.5rem] border border-white/10 italic text-lg leading-relaxed text-slate-300 font-medium font-serif min-h-[200px] flex items-center">
                {result?.remarks ? `"${result.remarks}"` : `"The instructional board's qualitative assessment for this period is still undergoing validation."`}
              </div>
              <div className="pt-8 border-t border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black">CT</div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest leading-none">Facilitator</p>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Digital Identity</p>
                  </div>
                </div>
                <Button onClick={() => window.print()} className="bg-white text-slate-900 px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-100 shadow-lg">
                  <Printer size={14} /> Official Report card
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-10 bg-indigo-600 text-white rounded-[2.5rem] space-y-6 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <ArrowUpRight size={20} />
              </div>
              <h4 className="font-black text-lg tracking-tight">Performance Matrix</h4>
            </div>
            <p className="text-indigo-100 text-xs leading-relaxed italic font-medium">The Kenyan Competency Based Curriculum (CBC) prioritizes learner engagement and practical application of knowledge across all learning areas.</p>
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Status</span>
              <span className="bg-white/20 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">Cycle Verified</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// --- Parent Dashboard View ---
const ParentDashboardView = ({ data }: { data: any }) => {
  return (
    <div className="space-y-10">
      <div className="p-16 bg-white rounded-[4rem] border border-slate-100 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50/50 rounded-full -mr-48 -mt-48 blur-3xl group-hover:scale-125 transition-transform duration-1000" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-50/30 rounded-full -ml-32 -mb-32 blur-3xl" />

        <div className="relative flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
          <div className="w-32 h-32 bg-indigo-600 rounded-[3rem] shadow-2xl flex items-center justify-center text-white text-5xl font-black border-4 border-white">
            {data.student.name[0]}
          </div>
          <div>
            <h2 className="text-5xl font-black text-slate-800 tracking-tighter mb-4">
              Hello, <span className="text-indigo-600">{data.student.name}</span>
            </h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <span className="px-6 py-2 bg-slate-100 text-slate-600 rounded-full text-[12px] font-black uppercase tracking-widest border border-slate-200">
                Class: {data.student.class}
              </span>
              <span className="px-6 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[12px] font-black uppercase tracking-widest border border-indigo-100">
                Adm: {data.student.admission_number}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="p-10 bg-indigo-600 text-white rounded-[3rem] shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-10 group-hover:scale-110 transition-transform">
            <Wallet size={80} />
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-60 mb-6">Current Balance</p>
          <p className="text-4xl font-black">
            KSH {(data.fees.reduce((s: number, f: any) => s + f.amount, 0) - data.fees.filter((f: any) => f.status === 'Paid').reduce((s: number, f: any) => s + f.amount, 0)).toLocaleString()}
          </p>
          <p className="text-[10px] font-bold mt-4 italic opacity-70 tracking-tight">Financial standing for current term</p>
        </Card>

        <Card className="p-10 bg-white border-slate-100 rounded-[3rem] shadow-xl hover:shadow-2xl transition-all group">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Academic Ranking</p>
          <p className="text-4xl font-black text-slate-800">
            {data.exams.length > 0 ? `${Math.round(data.exams.reduce((s: number, e: any) => s + e.marks, 0) / data.exams.length)}%` : 'N/A'}
          </p>
          <p className="text-[10px] font-bold mt-4 text-slate-400 tracking-tight">Average performance score</p>
        </Card>

        <Card className="p-10 bg-emerald-500 text-white rounded-[3rem] shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-10">
            <GraduationCap size={80} />
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-60 mb-6">Status</p>
          <p className="text-4xl font-black">Active</p>
          <p className="text-[10px] font-bold mt-4 italic opacity-70 tracking-tight">Learner fully validated for 2026</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <Card className="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-xl">
          <h3 className="text-xl font-black text-slate-800 tracking-tight mb-8">Performance Progression</h3>
          <div className="space-y-6">
            {data.exams.slice(0, 3).map((e: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="font-black text-slate-800">{e.subject}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{e.term} - {e.year}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-indigo-600">{e.marks}%</p>
                  <span className={cn(
                    "text-[8px] font-black uppercase px-2 py-1 rounded-md border",
                    e.marks >= 80 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      e.marks >= 60 ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                        e.marks >= 40 ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-rose-50 text-rose-600 border-rose-100'
                  )}>
                    {e.marks >= 80 ? 'EE' : e.marks >= 60 ? 'ME' : e.marks >= 40 ? 'AE' : 'BE'}
                  </span>
                </div>
              </div>
            ))}
            {data.exams.length === 0 && <p className="text-center py-10 text-slate-400 italic">No exam records found yet.</p>}
          </div>
        </Card>

        <Card className="p-10 bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl">
          <h3 className="text-xl font-black text-white tracking-tight mb-8">Recent Bulletins</h3>
          <div className="space-y-6">
            {data.announcements?.map((a: any, i: number) => (
              <div key={i} className="p-6 bg-white/5 rounded-2xl border border-white/10 group hover:bg-white/10 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-black text-indigo-400 text-[10px] uppercase tracking-widest">{new Date(a.created_at).toLocaleDateString()}</p>
                  <span className="text-[8px] font-bold bg-white/10 text-white/40 px-2 py-0.5 rounded text-uppercase">{a.type}</span>
                </div>
                <p className="font-bold text-slate-200 text-sm mb-2">{a.title}</p>
                <p className="text-slate-400 text-xs line-clamp-2 italic">{a.content}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// --- Parent Fees View ---
const ParentFeesView = ({ data }: { data: any }) => {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedTerm, setSelectedTerm] = useState('Term 1');

  const currentStructure = data.feeStructure?.find((s: any) => s.term === selectedTerm);
  const relevantFees = data.fees.filter((f: any) => f.term === selectedTerm && f.year === selectedYear);

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter">Finance & Receipts</h2>
          <p className="text-slate-500 font-medium italic">Monitor billing and official fee structures for {data.student.class}</p>
        </div>
        <div className="flex bg-slate-100 p-2 rounded-2xl gap-2">
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="bg-white border-none rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none shadow-sm cursor-pointer"
          >
            {['2024', '2025', '2026', '2027', '2028'].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select
            value={selectedTerm}
            onChange={e => setSelectedTerm(e.target.value)}
            className="bg-white border-none rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none shadow-sm cursor-pointer"
          >
            <option value="Term 1">Term 1</option>
            <option value="Term 2">Term 2</option>
            <option value="Term 3">Term 3</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1 p-10 bg-slate-900 text-white rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Wallet size={120} />
          </div>
          <h3 className="text-xl font-black mb-10 flex items-center gap-3">
            <Settings size={20} className="text-indigo-400" /> Statutory Billing
          </h3>
          {currentStructure ? (
            <div className="space-y-8">
              <div className="space-y-2">
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Mandatory Base Rate</p>
                <p className="text-4xl font-black text-white tracking-tighter">KSH {currentStructure.amount.toLocaleString()}</p>
              </div>
              <div className="space-y-2 pt-4 border-t border-white/10">
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Level Coverage</p>
                <p className="font-bold text-indigo-400">{selectedTerm}, {selectedYear}</p>
              </div>
              <Button className="w-full h-14 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl mt-4">
                Settle Dues Online
              </Button>
            </div>
          ) : (
            <div className="py-20 text-center opacity-30 italic text-sm">No billing schedule ratified for {data.student.class} in this cycle.</div>
          )}
        </Card>

        <div className="md:col-span-2 space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Verified Payment History</h3>
            <span className="text-[10px] font-black bg-slate-50 text-slate-400 px-4 py-2 rounded-full border border-slate-100 uppercase tracking-widest">
              {relevantFees.length} Entries Found
            </span>
          </div>
          {relevantFees.length === 0 ? (
            <div className="p-32 bg-white border-2 border-dashed border-slate-100 rounded-[3rem] text-center text-slate-400 italic">
              The ledger for this term is currently balanced (no records).
            </div>
          ) : (
            <div className="space-y-4">
              {relevantFees.map((f: any, i: number) => (
                <Card key={i} className="p-8 bg-white border-slate-100 shadow-xl rounded-[2.5rem] flex justify-between items-center group hover:shadow-2xl transition-all">
                  <div className="flex gap-6 items-center">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{f.status} {f.food_type ? ` - ${f.food_type.toUpperCase()}` : ''}</p>
                      <h4 className="text-xl font-black text-slate-800 tracking-tight">KSH {f.amount.toLocaleString()}.00</h4>
                      <p className="text-[10px] font-bold text-slate-400 italic mt-1">{new Date(f.date).toLocaleDateString()} at {new Date(f.date).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const win = window.open('', '_blank');
                      if (win) {
                        win.document.write(`
                          <html>
                            <head>
                              <title>Receipt - ${f.term}</title>
                              <style>
                                 @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap');
                                 body { font-family: 'Space Grotesk', sans-serif; padding: 40px; color: #1e293b; background: #f8fafc; }
                                 .receipt { max-width: 600px; margin: 0 auto; background: white; border: 2px solid #e2e8f0; padding: 60px; border-radius: 40px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1); }
                                 .header { text-align: center; margin-bottom: 40px; }
                                 .header h1 { font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin: 0; }
                                 .header p { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 4px; margin-top: 5px; }
                                 .row { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px dashed #e2e8f0; font-size: 14px; }
                                 .row span { color: #94a3b8; font-weight: 700; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; }
                                 .row strong { color: #1e293b; font-weight: 700; }
                                 .total-block { margin-top: 40px; padding: 30px; background: #f1f5f9; border-radius: 20px; text-align: center; }
                                 .total-block span { display: block; font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 4px; margin-bottom: 10px; }
                                 .total-block .amount { font-size: 32px; font-weight: 800; color: #020617; }
                                 .footer { margin-top: 60px; text-align: center; }
                                 .footer p { font-size: 10px; font-style: italic; color: #94a3b8; line-height: 1.6; }
                                 @media print { body { background: white; padding: 0; } .receipt { border: none; box-shadow: none; max-width: 100%; } }
                              </style>
                            </head>
                            <body onload="window.print()">
                              <div class="receipt">
                                 <div class="header">
                                    <h1>CHANGARA TOWNSHIP</h1>
                                    <p>Statutory Payment Voucher</p>
                                 </div>
                                 <div class="row"><span>Official Beneficiary</span> <strong>${data.student.name}</strong></div>
                                 <div class="row"><span>Identity Number</span> <strong>${data.student.admission_number}</strong></div>
                                 <div class="row"><span>Institutional Level</span> <strong>${data.student.class}</strong></div>
                                 <div class="row"><span>Academic Cycle</span> <strong>${f.term} ${selectedYear}</strong></div>
                                 <div class="row"><span>Validation Date</span> <strong>${new Date(f.date).toLocaleDateString()}</strong></div>
                                 <div class="row"><span>Transaction Status</span> <strong>AUTHENTICATED</strong></div>
                                 <div class="total-block">
                                    <span>Validated Amount</span>
                                    <div class="amount">KSH ${f.amount.toLocaleString()}</div>
                                 </div>
                                 <div class="footer">
                                    <p>This is a cryptographic-ally validated electronic receipt.<br/>Produced by Changara Township SMS Finance Division.</p>
                                 </div>
                              </div>
                            </body>
                          </html>
                        `);
                        win.document.close();
                      }
                    }}
                    className="flex flex-col items-center gap-2 p-4 text-slate-300 hover:text-indigo-600 transition-all border border-transparent hover:border-slate-100 hover:bg-slate-50 rounded-[2rem]"
                  >
                    <Printer size={20} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Receipt</span>
                  </button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Student Dashboard (Public Area) ---
const StudentDashboard = ({ data, onBack }: { data: any, onBack: () => void }) => {
  const [activeTab, setActiveTab] = useState<'fees' | 'academics' | 'notices'>('fees');

  const totalFees = data.fees.reduce((sum: number, fee: any) => sum + Number(fee.amount), 0);
  const paidFees = data.fees.filter((f: any) => f.status === 'paid').reduce((sum: number, fee: any) => sum + Number(fee.amount), 0);
  const balance = totalFees - paidFees;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full space-y-10 py-12"
    >
      <header className="flex flex-col md:flex-row items-center justify-between bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl relative overflow-hidden gap-10 text-center md:text-left">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10 w-full md:w-auto">
          <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex-shrink-0 flex items-center justify-center text-white font-black text-4xl shadow-2xl border border-white/20">
            {data.student.name[0]}
          </div>
          <div className="min-w-0">
            <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none truncate">{data.student.name}</h2>
              <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-200 whitespace-nowrap">CBC Validated</span>
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] flex items-center gap-3 justify-center md:justify-start">
              <School size={14} className="text-indigo-400" /> Grade: {data.student.class} <span className="opacity-30">|</span> Adm: {data.student.admission_number}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl relative z-10">
          {(['fees', 'academics', 'notices'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 md:px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === tab ? "bg-white text-indigo-600 shadow-lg shadow-indigo-100" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <Button onClick={onBack} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl group relative z-10">
          Logout Cabinet
        </Button>
      </header>

      {activeTab === 'fees' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <Card className="p-10 bg-indigo-600 text-white space-y-6 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Parental Fee Obligation</p>
            <div className="space-y-1">
              <p className="text-5xl font-black tracking-tighter">KSH {balance.toLocaleString()}</p>
              <p className="text-[10px] font-bold opacity-70 italic">Outstanding Balance for Current Session</p>
            </div>
            <div className="pt-4 border-t border-white/10 flex items-center gap-4">
              <div className="flex-1">
                <p className="text-[9px] uppercase font-black opacity-50 mb-1">Total Paid</p>
                <p className="font-mono font-black">KSH {paidFees.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Wallet size={18} />
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-2 p-10 bg-white border border-slate-100 shadow-2xl rounded-[3rem] space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Institutional Billing Statement</h3>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-xl">Historical Ledger</span>
            </div>
            <div className="space-y-4 max-h-[500px] overflow-auto pr-4 subtle-scrollbar">
              {data.fees.length === 0 ? (
                <div className="flex flex-col items-center py-20 gap-4 opacity-30">
                  <CreditCard size={44} />
                  <p className="italic font-bold">No billing cycles recorded.</p>
                </div>
              ) : (
                data.fees.map((fee: any) => (
                  <div key={fee.id} className="flex justify-between items-center p-6 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-xl transition-all group">
                    <div className="text-left">
                      <p className="font-black text-slate-800 text-lg tracking-tight mb-1">{fee.term}</p>
                      <p className="text-[10px] font-bold text-slate-400 flex items-center gap-2">
                        <Calendar size={12} /> {new Date(fee.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-black text-xl text-slate-900 group-hover:scale-110 transition-transform origin-right">KSH {fee.amount}</p>
                      <span className={cn(
                        "text-[8px] font-black uppercase px-3 py-1 rounded-full border inline-block mt-2",
                        fee.status === 'paid' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                      )}>{fee.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'academics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 text-left">
          <Card className="p-10 space-y-10 bg-white border border-slate-100 shadow-2xl rounded-[3.5rem] relative overflow-hidden">
            <div className="flex items-center gap-4 border-b border-slate-50 pb-8">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                <GraduationCap size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Competency Mastery</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Validated Assessment Outcomes</p>
              </div>
            </div>
            <div className="space-y-6 max-h-[600px] overflow-auto pr-4 subtle-scrollbar">
              {data.exams.length === 0 ? (
                <p className="text-slate-400 text-center py-20 italic font-medium">Academic assessment registry empty.</p>
              ) : (
                data.exams.map((res: any) => (
                  <div key={res.id} className="flex justify-between items-center p-6 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-xl transition-all group">
                    <div className="space-y-1">
                      <p className="font-black text-slate-800 tracking-tight text-lg leading-none truncate max-w-[200px]">{res.subject}</p>
                      <p className="text-[10px] font-bold text-slate-400 italic">{res.term} | {res.year}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none group-hover:scale-110 transition-transform origin-right">{res.marks}%</p>
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-2">{res.grade}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-10 bg-slate-900 text-white rounded-[3.5rem] shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="space-y-8 relative z-10">
              <div className="flex items-center gap-4 border-b border-white/10 pb-8">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">Lead Teacher Evaluative Remarks</h3>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic">Professional Qualitative Assessment</p>
                </div>
              </div>
              <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 italic text-lg leading-relaxed text-slate-300 font-medium font-serif min-h-[200px] flex items-center">
                "{data.student.name.split(' ')[0]} continues to demonstrate exceptional competency in creative areas. Social integration is excellent. Steady progress observed in all learning areas."
              </div>
              <div className="flex justify-between items-center pt-8 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-black text-white text-xs">TR</div>
                  <div>
                    <p className="text-[11px] font-black leading-none">Class Facilitator</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Digital Auth Signature</p>
                  </div>
                </div>
                <Button className="bg-white text-slate-900 px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2">
                  <Printer size={14} /> Official Report card
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'notices' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left">
          <div className="md:col-span-2 space-y-10">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-4">
              <Bell size={24} className="text-rose-500" /> Institutional Communique
            </h3>
            <div className="grid grid-cols-1 gap-6">
              {data.announcements && data.announcements.length > 0 ? (
                data.announcements.map((ann: any) => (
                  <Card key={ann.id} className="p-8 bg-white border border-slate-100 shadow-xl rounded-[2.5rem] hover:shadow-2xl transition-all relative overflow-hidden group">
                    <div className={cn(
                      "absolute top-0 left-0 w-1.5 h-full transition-all group-hover:w-3",
                      ann.type === 'Alert' ? "bg-rose-500" : ann.type === 'Holiday' ? "bg-amber-500" : "bg-indigo-500"
                    )}></div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className={cn(
                          "text-[8px] font-black px-3 py-1 rounded-lg border uppercase tracking-widest",
                          ann.type === 'Alert' ? "bg-rose-50 text-rose-600 border-rose-100" : ann.type === 'Holiday' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-indigo-50 text-indigo-600 border-indigo-100"
                        )}>{ann.type}</span>
                        <h4 className="text-xl font-black text-slate-800 tracking-tight mt-3">{ann.title}</h4>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 italic">{new Date(ann.created_at).toLocaleDateString()}</p>
                    </div>
                    <p className="text-slate-600 leading-relaxed font-medium">{ann.content}</p>
                  </Card>
                ))
              ) : (
                <div className="p-20 text-center bg-slate-50 border-none rounded-[3rem] opacity-30">
                  <p className="italic font-bold">No active bulletins for this cycle.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-10">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-4">
              <CalendarDays size={24} className="text-indigo-500" /> Academic Calendar
            </h3>
            <Card className="p-8 bg-indigo-50 border-none rounded-[2.5rem] space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-indigo-100">
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                    <Home size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Opening Date</p>
                    <p className="font-black text-slate-800 tracking-tight">May 5th, 2026</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-indigo-100">
                  <div className="w-10 h-10 bg-rose-500 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                    <Power size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Closing Date</p>
                    <p className="font-black text-slate-800 tracking-tight">August 8th, 2026</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-indigo-100">
                  <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                    <Trophy size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sports Day</p>
                    <p className="font-black text-slate-800 tracking-tight">June 15th, 2026</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest text-center shadow-lg shadow-indigo-200 cursor-default">
                Session 2 Validated
              </div>
            </Card>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// 3. Admin/Dashboard Layout
const DashboardShell = () => {
  const { user, loading, logout, checkAuth } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'teachers' | 'parents' | 'exams' | 'fees' | 'fee_structure' | 'messages' | 'child' | 'cbc_dashboard' | 'announcements' | 'academics'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'parent') {
      setActiveTab('child');
    } else if (user?.role === 'teacher') {
      setActiveTab('cbc_dashboard');
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/" />;

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, roles: ['headteacher', 'parent'] },
    { id: 'teachers', label: 'Teachers', icon: UserSquare, roles: ['headteacher'] },
    { id: 'parents', label: 'Parents', icon: UserCheck, roles: ['headteacher'] },
    { id: 'students', label: 'Students', icon: Users, roles: ['headteacher', 'teacher'] },
    { id: 'exams', label: 'Academic Performance', icon: BookMarked, roles: ['headteacher', 'teacher'] },
    { id: 'cbc_dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['teacher'] },
    { id: 'academics', label: 'My Learner', icon: School, roles: ['parent'] },
    { id: 'fees', label: 'Fees & Finance', icon: Wallet, roles: ['headteacher', 'parent'] },
    { id: 'fee_structure', label: 'Fee Structure', icon: Settings, roles: ['headteacher'] },
    { id: 'announcements', label: 'Institutional Bulletins', icon: Bell, roles: ['headteacher', 'teacher', 'parent'] },
    { id: 'messages', label: 'Messages', icon: Send, roles: ['headteacher'] },
  ].filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-72 bg-[#0a0f1d] text-slate-400 flex flex-col p-8 space-y-10 shadow-2xl z-40 transition-transform lg:relative lg:translate-x-0 overflow-hidden",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between lg:justify-start gap-4 px-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg rotate-3">CT</div>
            <div>
              <span className="text-white font-black text-lg tracking-tight block leading-tight">Changara</span>
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.25em]">Township</span>
            </div>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden text-slate-500 hover:text-white p-2">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto subtle-scrollbar pr-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id as any); setMobileMenuOpen(false); }}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group text-left mb-1",
                activeTab === item.id ? "bg-white/10 text-white font-bold shadow-sm" : "hover:bg-white/5 hover:text-slate-200"
              )}
            >
              <item.icon size={18} className={cn(activeTab === item.id ? "text-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.3)]" : "text-slate-600 group-hover:text-slate-400")} />
              <span className="text-[13px] tracking-tight">{item.label}</span>
              {activeTab === item.id && <motion.div layoutId="nav-pill" className="ml-auto w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(129,140,248,0.8)]" />}
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-white/5 flex items-center gap-4 px-2 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-sm">
            {user.email[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest truncate">{user.role}</p>
            <p className="text-[10px] text-slate-500 truncate font-mono">{user.email}</p>
          </div>
          <button onClick={() => logout().then(() => navigate('/'))} className="text-slate-600 hover:text-red-400 p-2 rounded-lg hover:bg-red-400/5 transition-all">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 lg:p-12 overflow-auto bg-slate-50/50 backdrop-blur-3xl">
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-100 text-slate-600"
            >
              <Menu size={20} />
            </button>
            <div className="hidden lg:flex w-10 h-10 bg-white rounded-xl shadow-sm items-center justify-center border border-slate-100">
              <div className="w-5 h-5 bg-indigo-600 rounded-md rotate-12"></div>
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
                {menuItems.find(i => i.id === activeTab)?.label}
                <span className="inline-flex items-center justify-center h-6 px-3 text-[10px] font-black bg-indigo-100 text-indigo-600 rounded-full border border-indigo-200">
                  CBC v2.4
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex bg-white px-4 py-2 rounded-2xl border border-slate-200 items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Online</span>
            </div>
            <div className="hidden sm:flex bg-white px-4 py-2 rounded-2xl border border-slate-200 items-center gap-2 shadow-sm text-slate-500 text-[10px] uppercase tracking-widest">
              <CalendarDays size={14} className="text-indigo-600" />
              {getFormattedToday()}
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {activeTab === 'dashboard' && user?.role !== 'parent' && <DashboardHome />}
            {activeTab === 'dashboard' && user?.role === 'parent' && (
              (user as any).parentInfo ? (
                (user as any).parentInfo.none ? (
                  <div className="p-20 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-100 flex flex-col items-center gap-8 shadow-inner">
                    <div className="w-24 h-24 bg-amber-50 text-amber-600 rounded-[2.5rem] flex items-center justify-center shadow-xl border border-amber-100 animate-bounce">
                      <ShieldAlert size={48} />
                    </div>
                    <div className="space-y-4 max-w-md">
                      <h3 className="text-3xl font-black text-slate-800 tracking-tighter">Student Identity Not Linked</h3>
                      <p className="text-slate-500 font-medium italic leading-relaxed">We couldn't locate a student record associated with this email address. Please visit the school administration office to verify your admission details and academic link.</p>
                    </div>
                    <Button onClick={() => checkAuth()} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl hover:bg-black transition-all">
                      Retry Synchronization
                    </Button>
                  </div>
                ) : (
                  <ParentDashboardView data={(user as any).parentInfo} />
                )
              ) : (
                <div className="p-20 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-100 flex flex-col items-center gap-6">
                  <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-slate-400 font-black italic tracking-tighter text-xl">
                    Synchronizing Learner Identity...
                  </p>
                </div>
              )
            )}
            {activeTab === 'students' && <StudentsManagement role={user.role} />}
            {activeTab === 'teachers' && <TeachersManagement />}
            {activeTab === 'parents' && <ParentsManagement />}
            {activeTab === 'fees' && user?.role !== 'parent' && <FeesManagement />}
            {activeTab === 'fee_structure' && <FeeStructureManagement />}
            {activeTab === 'exams' && <ExamsManagement role={user.role} />}
            {activeTab === 'announcements' && user?.role !== 'parent' && <AnnouncementsManagement role={user.role} />}
            {activeTab === 'cbc_dashboard' && <ClassTeacherDashboard />}
            {activeTab === 'messages' && <MessagesManagement />}
            {activeTab === 'academics' && (user as any).parentInfo ? (
              <AcademicsParentView data={(user as any).parentInfo} />
            ) : activeTab === 'academics' ? (
              <div className="p-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                <p className="text-slate-400 font-bold italic tracking-tight">System synchronizing academic link...</p>
              </div>
            ) : null}

            {activeTab === 'fees' && user?.role === 'parent' && (user as any).parentInfo && (
              <ParentFeesView data={(user as any).parentInfo} />
            )}

            {activeTab === 'announcements' && user?.role === 'parent' && (
              <AnnouncementsManagement role={user.role} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

// --- Dashboard Sections ---

const ClassTeacherDashboard = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');

  useEffect(() => {
    fetch('/api/students', { credentials: 'include' }).then(res => res.json()).then(setStudents);
    if (user?.role === 'teacher' && (user as any).teacherInfo?.classes?.length > 0) {
      setSelectedClass((user as any).teacherInfo.classes[0]);
    }
  }, [user]);

  const teacherInfo = (user as any)?.teacherInfo;
  const isClassTeacher = teacherInfo?.teacher_role === 'Class Teacher';

  if (!isClassTeacher) {
    return (
      <Card className="p-20 text-center space-y-6 bg-slate-50 border-dashed border-2 border-slate-200 rounded-[3rem]">
        <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-amber-100">
          <ShieldCheck size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Access Restricted</h3>
          <p className="text-slate-500 font-medium max-w-sm mx-auto italic">This master view is exclusive to designated Class Teachers / Form Tutors. Please refer to your Subject view for individual academic entry.</p>
        </div>
      </Card>
    );
  }

  const classStudents = students.filter(s => s.class === selectedClass);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">CBC Master Dashboard</h2>
          <p className="text-slate-500 font-medium flex items-center gap-2 italic">
            <UserSquare size={16} className="text-indigo-400" /> Administrative Hub for Class:
            <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg not-italic font-black text-[10px] tracking-widest border border-indigo-100">{selectedClass}</span>
          </p>
        </div>
        <div className="flex gap-4">
          {teacherInfo.classes.map((c: string) => (
            <Button
              key={c}
              onClick={() => setSelectedClass(c)}
              className={cn(
                "px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm",
                selectedClass === c ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200" : "bg-white text-slate-400 hover:text-slate-600 border border-slate-100"
              )}
            >
              {c} Profile
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <Card className="lg:col-span-2 p-10 bg-white border border-slate-100 shadow-2xl rounded-[3rem] overflow-hidden relative">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-xl text-slate-800 tracking-tight">Learner Progression Tracker</h3>
            <span className="text-[10px] font-black text-indigo-400 bg-indigo-50 px-4 py-2 rounded-xl uppercase tracking-widest border border-indigo-100 flex items-center gap-2">
              <Menu size={12} /> {classStudents.length} Active Profiles
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-50">
                  <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Adm#</th>
                  <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Learner Full Name</th>
                  <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">CBC Mastery Level</th>
                  <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {classStudents.map(s => (
                  <tr key={s.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="py-6 font-mono text-[10px] font-black text-indigo-400 pl-4">#{s.admission_number}</td>
                    <td className="py-6 font-black text-slate-800 tracking-tight whitespace-nowrap">{s.name}</td>
                    <td className="py-6">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 max-w-[120px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full w-[75%] bg-indigo-500 rounded-full"></div>
                        </div>
                        <span className="text-[10px] font-black text-slate-400">ME (75%)</span>
                      </div>
                    </td>
                    <td className="py-6 pr-4">
                      <Button className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all uppercase tracking-widest">
                        View Transcript
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-10">
          <Card className="p-8 bg-[#0f172a] text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-transform"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mt-2">Class Attendance Avg</p>
            <div className="py-6">
              <h4 className="text-6xl font-black tracking-tighter mb-4">98.4%</h4>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[98.4%] rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
              </div>
            </div>
            <p className="text-[9px] font-bold text-slate-500 tracking-widest uppercase">Verified Termly Sync</p>
          </Card>

          <Card className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-xl space-y-6">
            <h3 className="font-black text-slate-800 tracking-tight flex items-center gap-3">
              <Target size={20} className="text-rose-500" /> Critical Focus Areas
            </h3>
            <div className="space-y-4">
              {[
                { area: 'Literacy Development', status: 'ME', color: 'indigo' },
                { area: 'Numeracy Mastery', status: 'EE', color: 'emerald' },
                { area: 'Creative Expressions', status: 'AE', color: 'amber' },
              ].map(item => (
                <div key={item.area} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:scale-105 transition-transform cursor-default">
                  <span className="text-[11px] font-black text-slate-700 tracking-tight">{item.area}</span>
                  <span className={cn(
                    "text-[9px] font-black px-3 py-1 rounded-lg border",
                    item.status === 'EE' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                      item.status === 'ME' ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                        "bg-amber-50 text-amber-600 border-amber-100"
                  )}>{item.status}</span>
                </div>
              ))}
            </div>
            <Button className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-colors">
              Generate Class Performance Report
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

// --- Dashboard Sections ---

const DashboardHome = () => {
  const { user } = useAuth();
  if (user?.role === 'parent') return null;

  const [stats, setStats] = useState<any>({ students: 0, teachers: 0, parents: 0, messages: 0, totalFees: 0, feeTrends: [], academicTrends: [] });
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [term, setTerm] = useState(getCurrentAcademicTerm());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetch(`/api/stats?year=${academicYear}&term=${term}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setStats(data);
        }
      });

    fetch('/api/public/announcements', { credentials: 'include' })
      .then(res => res.json())
      .then(setAnnouncements)
      .catch(err => console.error("Announcements fetch error:", err));
  }, [academicYear, term]);

  const cards = [
    { label: 'Total Revenue', value: stats.totalFees ? `KSH ${stats.totalFees.toLocaleString()}` : 'KSH 0', icon: Wallet, color: 'emerald', sub: 'Gross Collections', trend: '+12%' },
    { label: 'Learner Cohort', value: stats.students, icon: Users, color: 'indigo', sub: 'Institutional Roll', trend: '+5%' },
    { label: 'Faculty Active', value: stats.teachers, icon: GraduationCap, color: 'purple', sub: 'Deployment Status', trend: 'Stable' },
    { label: 'Link Readiness', value: stats.parents, icon: ShieldCheck, color: 'amber', sub: 'Parent Synchronization', trend: '98%' },
  ];

  const pieData = [
    { name: 'Collected', value: stats.totalFees || 0, fill: '#4f46e5' },
    { name: 'Pending', value: Math.max(0, 5000000 - (stats.totalFees || 0)), fill: '#f1f5f9' },
  ];

  return (
    <div className="space-y-12">
      {/* Top Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Strategic Insights</h2>
          <p className="text-slate-500 font-medium italic text-sm">Institutional growth metrics and performance analytics for {academicYear}.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="flex items-center gap-2 px-4 py-2 border-r border-slate-100">
            <Calendar size={16} className="text-indigo-600" />
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="bg-transparent font-black text-xs text-slate-800 outline-none cursor-pointer"
            >
              <option value="2024">2024 Cycle</option>
              <option value="2025">2025 Cycle</option>
              <option value="2026">2026 Cycle</option>
              <option value="2027">2027 Cycle</option>
              <option value="2028">2028 Cycle</option>
            </select>
          </div>
          <div className="flex items-center gap-2 px-4 py-2">
            <TrendingUp size={16} className="text-indigo-600" />
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="bg-transparent font-black text-xs text-slate-800 outline-none cursor-pointer"
            >
              <option value="Term 1">Term 1</option>
              <option value="Term 2">Term 2</option>
              <option value="Term 3">Term 3</option>
            </select>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 border-l border-slate-100 text-slate-500 text-xs font-black uppercase tracking-[0.2em]">
            <CalendarDays size={16} className="text-indigo-600" />
            {getFormattedToday()}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-8 group hover:shadow-2xl transition-all border-none relative overflow-hidden h-52 flex flex-col justify-between">
              <div className="flex justify-between items-start relative z-10">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", {
                  'bg-emerald-600': card.color === 'emerald',
                  'bg-indigo-600': card.color === 'indigo',
                  'bg-purple-600': card.color === 'purple',
                  'bg-amber-600': card.color === 'amber',
                })}>
                  <card.icon size={22} />
                </div>
                <div className="text-[10px] font-black px-3 py-1 rounded-full bg-slate-50 text-slate-500 uppercase tracking-widest border border-slate-100 italic">
                  {card.trend}
                </div>
              </div>
              <div className="space-y-1 relative z-10">
                <p className="text-3xl font-black text-slate-900 tracking-tighter">{card.value}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{card.label}</p>
                  <ArrowUpRight size={12} className="text-emerald-500" />
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-slate-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <Card className="xl:col-span-2 p-10 border-none shadow-2xl rounded-[3rem] space-y-8 bg-white">
          <div className="flex justify-between items-center px-2">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Academic Performance Trajectory</h3>
              <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest leading-none">Term Performance Trends</p>
            </div>
            <button onClick={() => window.print()} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 hover:text-indigo-600 transition-colors">
              <Printer size={18} />
            </button>
          </div>
          <div className="h-[350px] w-full min-w-0 relative">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={stats?.academicTrends?.length ? stats.academicTrends : [{ term: 'Term 1', avg: 72 }, { term: 'Term 2', avg: 85 }, { term: 'Term 3', avg: 78 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="term" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 900 }} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} dx={-10} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}
                    itemStyle={{ fontWeight: 700, fontSize: '14px', color: '#6366f1' }}
                  />
                  <Bar dataKey="avg" radius={[12, 12, 0, 0]} barSize={50}>
                    {stats?.academicTrends?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4f46e5' : '#818cf8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-10 border-none shadow-2xl rounded-[3rem] space-y-8 bg-[#0a0f1d] text-white flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-black tracking-tight">Fee Collection</h3>
            <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest leading-none">Budget Variance</p>
          </div>

          <div className="h-[250px] w-full relative min-w-0">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-2xl font-black text-white">
                {Math.round((stats.totalFees / 5000000) * 100) || 0}%
              </p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Achieved</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                <span className="text-sm font-bold text-slate-300">Collected</span>
              </div>
              <span className="font-black">KSH {stats.totalFees?.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-slate-800 rounded-full"></div>
                <span className="text-sm font-bold text-slate-300">Balance</span>
              </div>
              <span className="font-black text-slate-500">KSH {(5000000 - (stats.totalFees || 0)).toLocaleString()}</span>
            </div>
            <button onClick={() => window.print()} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
              <Download size={16} /> Download Report
            </button>
          </div>
        </Card>
      </div>

      {/* Institutional Growth Secondary Area */}
      <Card className="p-10 border-none shadow-xl rounded-[3rem] bg-indigo-50/30 flex flex-col lg:flex-row items-center gap-10">
        <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center text-indigo-600 shrink-0">
          <TrendingUp size={32} />
        </div>
        <div className="space-y-4">
          <h4 className="text-2xl font-black text-slate-900 tracking-tight">Institutional Resilience Metrics</h4>
          <p className="text-slate-500 font-medium italic text-sm leading-relaxed max-w-3xl">
            Dashboard analytics are calibrated to the 2026 Academic Cycle. Current data reflects real-time synchronization between the student registry and financial ledger. Automatic auditing is active across all instructional facets.
          </p>
        </div>
        <div className="lg:ml-auto flex gap-4">
          <div className="text-center px-8">
            <p className="text-2xl font-black text-indigo-600">98%</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency</p>
          </div>
          <div className="text-center px-8 border-l border-indigo-100">
            <p className="text-2xl font-black text-emerald-600">Active</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Node Status</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

const ParentsManagement = () => {
  const [parents, setParents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchParents = async () => {
    const res = await fetch('/api/admin/parents', { credentials: 'include' });
    if (res.ok) setParents(await res.json());
  };

  useEffect(() => {
    fetchParents();
  }, []);

  const filteredParents = parents.filter(p =>
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(p.id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredParents.length / itemsPerPage);
  const paginatedParents = filteredParents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePrint = () => window.print();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center print:hidden">
        <div className="flex items-center gap-6">
          <h2 className="text-2xl font-black tracking-tight text-slate-800">Linked Guardian Accounts</h2>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <Input
              placeholder="Search parents by email or ID..."
              className="pl-12 w-[350px] h-12 bg-white border-slate-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all font-bold"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>
        <div className="flex gap-4">
          <Button onClick={fetchParents} className="bg-indigo-50 text-indigo-600 border border-indigo-200 px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-indigo-100 transition-all">
            <RefreshCw size={16} /> Refresh List
          </Button>
          <Button onClick={handlePrint} className="bg-slate-50 text-slate-600 border border-slate-200 px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-slate-100 transition-all">
            <Printer size={16} /> Print Roll
          </Button>
          <div className="text-[10px] font-black text-slate-400 bg-slate-100 px-6 py-2.5 rounded-full uppercase tracking-widest border border-slate-200 flex items-center">
            {filteredParents.length} Matching Accounts
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden print:shadow-none print:border-none">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100 italic text-[10px] text-slate-400 uppercase tracking-[0.25em]">
            <tr>
              <th className="px-10 py-6">Unique ID</th>
              <th className="px-10 py-6">Registered Email</th>
              <th className="px-10 py-6">Enrollment Date</th>
              <th className="px-10 py-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginatedParents.map(p => (
              <tr key={p.id} className="group hover:bg-slate-50 transition-all">
                <td className="px-10 py-6">
                  <span className="font-mono text-[10px] font-black text-indigo-400 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                    {String(p.id).split('-')[0].toUpperCase()}
                  </span>
                </td>
                <td className="px-10 py-6">
                  <div className="flex items-center gap-3">
                    <Mail size={14} className="text-slate-300" />
                    <span className="font-black text-slate-800 tracking-tight text-sm">{p.email}</span>
                  </div>
                </td>
                <td className="px-10 py-6 text-xs text-slate-500 font-bold italic">
                  {new Date(p.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </td>
                <td className="px-10 py-6">
                  <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full uppercase tracking-widest border border-emerald-100">Verified Parent</span>
                </td>
              </tr>
            ))}
            {filteredParents.length === 0 && (
              <tr>
                <td colSpan={4} className="px-10 py-24 text-center">
                  <p className="text-slate-400 italic font-medium">No parent accounts matching your criteria.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
              <div className="h-1 w-12 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: `${(currentPage / totalPages) * 100}%` }}></div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-10 h-10 p-0 rounded-xl bg-white border border-slate-200 text-slate-400 disabled:opacity-30"><ChevronLeft size={18} /></Button>
              <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-10 h-10 p-0 rounded-xl bg-white border border-slate-200 text-slate-400 disabled:opacity-30"><ChevronRight size={18} /></Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FeeStructureManagement = () => {
  const [structures, setStructures] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ class: '', term1: '', term2: '', term3: '' });
  const [saving, setSaving] = useState(false);

  const fetchStructures = () => fetch('/api/fee-structure', { credentials: 'include' }).then(res => res.json()).then(setStructures);
  useEffect(() => { fetchStructures(); }, []);

  const handleBulkAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/fee-structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          level: formData.class,
          term1: formData.term1,
          term2: formData.term2,
          term3: formData.term3
        })
      });

      if (res.ok) {
        setShowAdd(false);
        setFormData({ class: '', term1: '', term2: '', term3: '' });
        fetchStructures();
        alert(`Institutional fee structure for ${formData.class} level has been successfully applied.`);
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteStructureByClass = async (className: string) => {
    if (!confirm(`Are you sure you want to revoke the rate schedule for ${className}?`)) return;
    await fetch(`/api/fee-structure/${className}`, { method: 'DELETE', credentials: 'include' });
    fetchStructures();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-10 print:p-0">
      <div className="flex justify-between items-center print:hidden">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight text-slate-800">Master Fee Schedule</h2>
          <p className="text-slate-400 font-medium italic text-sm tracking-tight">Institutional cost management by CBC levels (Foundation, Primary, JSS)</p>
        </div>
        <div className="flex gap-4">
          <Button onClick={handlePrint} className="bg-slate-50 text-slate-600 border border-slate-200 px-8 py-4 rounded-2xl flex items-center gap-3 hover:bg-slate-100 transition-all shadow-sm">
            <Printer size={20} /> Export Matrix
          </Button>
          <Button onClick={() => setShowAdd(true)} className="bg-slate-900 text-white flex items-center gap-3 px-8 py-4 rounded-2xl shadow-2xl hover:bg-black transition-all font-black text-[10px] uppercase tracking-widest">
            <Plus size={20} /> Configure Level Rates
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <Card className="p-10 border-none shadow-2xl rounded-[3rem] bg-white border-2 border-slate-50">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-black text-slate-800 tracking-tight">New Level Rate Configuration</h3>
                <button onClick={() => setShowAdd(false)} className="text-slate-300 hover:text-slate-600 transition-colors">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleBulkAdd} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Target Grade/Level</label>
                    <select className="w-full h-16 bg-slate-50 px-6 rounded-2xl font-black text-xs uppercase tracking-widest border-none outline-none focus:ring-2 focus:ring-slate-900 transition-all" value={formData.class} onChange={e => setFormData({ ...formData, class: e.target.value })} required>
                      <option value="">Select Level Category</option>
                      <option value="Foundation & Pre-Primary">Foundation & Pre-Primary (PP1-PP2)</option>
                      <option value="Lower/Upper Primary">Lower/Upper Primary (Grades 1-6)</option>
                      <option value="Junior Secondary (JSS)">Junior Secondary (Grades 7-9)</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Term 1 Rate (KSH)</label>
                    <Input className="h-16 bg-slate-50 border-none rounded-2xl font-black text-lg" type="number" value={formData.term1} onChange={e => setFormData({ ...formData, term1: e.target.value })} required placeholder="0.00" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Term 2 Rate (KSH)</label>
                    <Input className="h-16 bg-slate-50 border-none rounded-2xl font-black text-lg" type="number" value={formData.term2} onChange={e => setFormData({ ...formData, term2: e.target.value })} required placeholder="0.00" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Term 3 Rate (KSH)</label>
                    <Input className="h-16 bg-slate-50 border-none rounded-2xl font-black text-lg" type="number" value={formData.term3} onChange={e => setFormData({ ...formData, term3: e.target.value })} required placeholder="0.00" />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={saving} className="flex-1 h-16 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
                    {saving ? <Loader2 className="animate-spin" /> : <ShieldCheck size={20} />}
                    Commit Rate Schedule to Registry
                  </Button>
                  <Button type="button" onClick={() => setShowAdd(false)} className="px-10 h-16 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest">Cancel</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl overflow-hidden print:shadow-none print:border-none">
        <div className="p-12 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Institutional Billing Matrix</h3>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] italic">Authorized 2026 Academic Cycle Rates</p>
          </div>
          <div className="hidden print:block text-right">
            <p className="font-black text-xs">Changara Township</p>
            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mt-1">Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 italic text-[10px] text-slate-400 uppercase tracking-[0.3em]">
                <th className="px-12 py-8 border-b border-slate-100">Educational Level</th>
                <th className="px-12 py-8 border-b border-slate-100 text-center">Term 1 (KSH)</th>
                <th className="px-12 py-8 border-b border-slate-100 text-center">Term 2 (KSH)</th>
                <th className="px-12 py-8 border-b border-slate-100 text-center">Term 3 (KSH)</th>
                <th className="px-12 py-8 border-b border-slate-100 print:hidden text-right">Governance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(() => {
                const grouped = structures.reduce((acc: any, s: any) => {
                  const amt = Number(s.amount) || 0;
                  if (!acc[s.class]) acc[s.class] = { t1: 0, t2: 0, t3: 0, ids: [] };
                  if (s.term === 'Term 1') acc[s.class].t1 = amt;
                  if (s.term === 'Term 2') acc[s.class].t2 = amt;
                  if (s.term === 'Term 3') acc[s.class].t3 = amt;
                  acc[s.class].ids.push(s.id);
                  return acc;
                }, {});

                const levels = [
                  { name: 'Foundation & Pre-Primary', classes: ['Playgroup', 'PP1', 'PP2'] },
                  { name: 'Lower/Upper Primary', classes: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'] },
                  { name: 'Junior Secondary (JSS)', classes: ['Grade 7', 'Grade 8', 'Grade 9'] }
                ];

                return levels.map(level => {
                  const levelClasses = level.classes.filter(c => grouped[c]);
                  if (levelClasses.length === 0) return null;

                  return (
                    <Fragment key={level.name}>
                      <tr className="bg-slate-100/50">
                        <td colSpan={5} className="px-12 py-3 text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">{level.name}</td>
                      </tr>
                      {levelClasses.map(className => {
                        const rates = grouped[className];
                        return (
                          <tr key={className} className="group hover:bg-slate-50/50 transition-all font-sans">
                            <td className="px-12 py-8 font-black text-lg text-slate-900 tracking-tight">{className}</td>
                            <td className="px-12 py-8 text-center font-mono font-black text-slate-700 text-lg">
                              {rates.t1.toLocaleString()}.00
                            </td>
                            <td className="px-12 py-8 text-center font-mono font-black text-slate-700 text-lg">
                              {rates.t2.toLocaleString()}.00
                            </td>
                            <td className="px-12 py-8 text-center font-mono font-black text-slate-700 text-lg">
                              {rates.t3.toLocaleString()}.00
                            </td>
                            <td className="px-12 py-8 print:hidden text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => {
                                  setFormData({
                                    class: className,
                                    term1: rates.t1.toString(),
                                    term2: rates.t2.toString(),
                                    term3: rates.t3.toString(),
                                  });
                                  setShowAdd(true);
                                }} className="text-slate-300 hover:text-indigo-600 transition-colors p-3 rounded-2xl hover:bg-indigo-50 border border-transparent hover:border-indigo-100">
                                  <Edit size={18} />
                                </button>
                                <button onClick={() => deleteStructureByClass(className)} className="text-slate-300 hover:text-rose-600 transition-colors p-3 rounded-2xl hover:bg-rose-50 border border-transparent hover:border-rose-100">
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </Fragment>
                  );
                });
              })()}
              {structures.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-12 py-32 text-center">
                    <div className="flex flex-col items-center gap-6 opacity-30 grayscale transition-all hover:grayscale-0">
                      <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center">
                        <Wallet size={40} className="text-slate-400" />
                      </div>
                      <p className="text-slate-400 font-black italic tracking-tighter text-xl">Institution is currently non-billing. No rate matrix defined.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-10 bg-slate-50/30 border-t border-slate-100 flex justify-between items-center italic">
          <p className="text-[9px] text-slate-400 font-bold max-w-sm">This is an electronically generated and authenticated fee board. All values are subject to institutional board oversight.</p>
          <div className="w-24 h-1 bg-indigo-600/10 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

const StudentsManagement = ({ role }: { role: string }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showAdd, setShowAdd] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    admission_number: '',
    name: '',
    class: '',
    upi_number: '',
    health_complications: '',
    has_disability: false,
  });
  const [parents, setParents] = useState([{ name: '', email: '', phone: '+254' }]);

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.admission_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const fetchStudents = async () => {
    const res = await fetch('/api/students', { credentials: 'include' });
    if (res.ok) setStudents(await res.json());
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleAddParent = () => {
    setParents([...parents, { name: '', email: '', phone: '+254' }]);
  };

  const handleRemoveParent = (index: number) => {
    if (parents.length > 1) {
      setParents(parents.filter((_, i) => i !== index));
    }
  };

  const handleParentChange = (index: number, field: string, value: string) => {
    const updated = [...parents];
    updated[index] = { ...updated[index], [field]: value };
    setParents(updated);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phones
    for (const p of parents) {
      if (!p.phone.startsWith('+254') || p.phone.length < 13) {
        alert(`Parent phone for ${p.name || 'new parent'} must be in +254 format (e.g. +254712345678)`);
        return;
      }
    }

    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...formData, parents })
    });
    if (res.ok) {
      fetchStudents();
      setShowAdd(false);
      setFormData({
        admission_number: '',
        name: '',
        class: '',
        upi_number: '',
        health_complications: '',
        has_disability: false,
      });
      setParents([{ name: '', email: '', phone: '+254' }]);
      alert('Student admitted successfully! Parent account created. Switch to Parents tab to see the new account.');
    } else {
      const errData = await res.json().catch(() => ({}));
      console.error('Admission error details:', errData);
      alert(`Failed to admit student: ${errData.error || 'Check for duplicate Admission numbers.'}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this student record? This will also remove the guardian login association.')) return;
    const res = await fetch(`/api/students/${id}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) fetchStudents();
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      admission_number: student.admission_number,
      name: student.name,
      class: student.class,
      upi_number: student.upi_number || '',
      health_complications: student.health_complications || '',
      has_disability: student.has_disability || false,
    });
    setShowAdd(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    const res = await fetch(`/api/students/${editingStudent.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      fetchStudents();
      setEditingStudent(null);
      setFormData({
        admission_number: '',
        name: '',
        class: '',
        upi_number: '',
        health_complications: '',
        has_disability: false,
      });
    } else {
      const errData = await res.json().catch(() => ({}));
      alert(`Failed to update student: ${errData.error || 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          <h2 className="text-2xl font-black tracking-tight text-slate-800">Institutional Student Registry</h2>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <Input
              placeholder="Search by name, ID or class..."
              className="pl-12 w-[350px] h-12 bg-white border-slate-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all font-bold placeholder:font-medium placeholder:text-slate-300"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>
        <div className="flex gap-4 print:hidden">
          <Button onClick={() => window.print()} className="bg-slate-50 text-slate-600 border border-slate-200 px-6 py-4 rounded-2xl flex items-center gap-2 hover:bg-slate-100 transition-all shadow-sm">
            <Printer size={20} /> Export Roll
          </Button>
          {role === 'headteacher' && (
            <Button onClick={() => setShowAdd(true)} className="bg-indigo-600 text-white flex items-center gap-3 px-8 py-4 rounded-2xl shadow-xl hover:bg-indigo-700 transition-all">
              <Plus size={20} /> Admit New CBC Student
            </Button>
          )}
        </div>
      </div>

      {(showAdd || editingStudent) && (
        <Card className="p-10 bg-white border-slate-100 shadow-2xl rounded-[2.5rem]">
          <form onSubmit={editingStudent ? handleUpdate : handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-[10px] font-black text-slate-400 border-l-4 border-indigo-600 pl-4 uppercase tracking-[0.2em]">
                {editingStudent ? 'Edit Learner Identity' : 'Learner Identity'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Admission No.</label>
                  <Input className="h-14 bg-slate-50 border-none rounded-xl font-bold" placeholder="e.g. CBC/2024/001" value={formData.admission_number} onChange={e => setFormData({ ...formData, admission_number: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Learner Full Name</label>
                  <Input className="h-14 bg-slate-50 border-none rounded-xl font-bold" placeholder="Full name as per birth certificate" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Health Complications / Allergies</label>
                  <Input className="h-14 bg-slate-50 border-none rounded-xl font-bold" placeholder="e.g. Allergy to beans, Asthma, etc." value={formData.health_complications} onChange={e => setFormData({ ...formData, health_complications: e.target.value })} />
                </div>
                <div className="space-y-2 flex flex-col justify-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2">Disability Status</label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, has_disability: false })}
                      className={cn(
                        "flex-1 h-14 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all",
                        !formData.has_disability ? "bg-indigo-600 text-white border-indigo-600 shadow-lg" : "bg-slate-50 text-slate-400 border-slate-100"
                      )}
                    >
                      No Disability
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, has_disability: true })}
                      className={cn(
                        "flex-1 h-14 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all",
                        formData.has_disability ? "bg-rose-600 text-white border-rose-600 shadow-lg" : "bg-slate-50 text-slate-400 border-slate-100"
                      )}
                    >
                      Has Disability
                    </button>
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">CBC Grade Selection</label>
                  <select
                    className="w-full h-14 px-4 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-600 font-black text-sm"
                    value={formData.class}
                    onChange={e => setFormData({ ...formData, class: e.target.value })}
                    required
                  >
                    <option value="">Select Level</option>
                    <optgroup label="Foundation & Pre-Primary">
                      <option value="Playgroup">Playgroup</option>
                      <option value="PP1">PP1 (Pre-Primary 1)</option>
                      <option value="PP2">PP2 (Pre-Primary 2)</option>
                    </optgroup>
                    <optgroup label="Primary School">
                      <option value="Grade 1">CBC Grade 1</option>
                      <option value="Grade 2">CBC Grade 2</option>
                      <option value="Grade 3">CBC Grade 3</option>
                      <option value="Grade 4">CBC Grade 4</option>
                      <option value="Grade 5">CBC Grade 5</option>
                      <option value="Grade 6">CBC Grade 6</option>
                    </optgroup>
                    <optgroup label="Junior Secondary">
                      <option value="Grade 7 (JSS)">Grade 7 (JSS)</option>
                      <option value="Grade 8 (JSS)">Grade 8 (JSS)</option>
                      <option value="Grade 9 (JSS)">Grade 9 (JSS)</option>
                    </optgroup>
                  </select>
                </div>
                {formData.class === 'Grade 3' && (
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">UPI Number (optional)</label>
                    <Input
                      className="h-14 bg-slate-50 border-none rounded-xl font-bold"
                      placeholder="UPI Number for Grade 3 learners"
                      value={formData.upi_number}
                      onChange={e => setFormData({ ...formData, upi_number: e.target.value })}
                    />
                    <p className="text-[10px] text-slate-400 italic">Optional for Grade 3. Leave blank if not yet assigned.</p>
                  </div>
                )}
              </div>
            </div>

            {!editingStudent && (
              <div className="space-y-4 md:col-span-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-black text-slate-400 border-l-4 border-emerald-500 pl-4 uppercase tracking-[0.2em]">Guardian Connectivity</h3>
                  <Button type="button" onClick={handleAddParent} className="bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase px-4 py-2 rounded-xl flex items-center gap-2">
                    <Plus size={14} /> Add Another Parent
                  </Button>
                </div>
                <p className="text-[9px] font-bold text-slate-400 pl-4 italic">Guardian accounts create automatically. Login with child's Admission No. as password.</p>

                <div className="space-y-6">
                  {parents.map((parent, index) => (
                    <div key={index} className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 relative group/parent">
                      {parents.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveParent(index)}
                          className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      )}
                      <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-4">Parent / Guardian #{index + 1}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Full Name</label>
                          <Input className="h-14 bg-white border-none rounded-xl font-bold" placeholder="Parent Name" value={parent.name} onChange={e => handleParentChange(index, 'name', e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Phone (+254)</label>
                          <Input className="h-14 bg-white border-none rounded-xl font-bold" placeholder="+254..." value={parent.phone} onChange={e => handleParentChange(index, 'phone', e.target.value)} required />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Email (Login Identity)</label>
                          <Input className="h-14 bg-white border-none rounded-xl font-bold" type="email" placeholder="guardian@email.com" value={parent.email} onChange={e => handleParentChange(index, 'email', e.target.value)} required />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="md:col-span-2 flex gap-4 pt-6">
              <Button type="submit" className="bg-indigo-600 text-white flex-1 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">
                {editingStudent ? 'Update Record' : 'Complete Admission'}
              </Button>
              <Button type="button" onClick={() => { setShowAdd(false); setEditingStudent(null); }} className="bg-slate-100 text-slate-500 px-10 rounded-2xl font-bold text-xs uppercase cursor-pointer">Discard</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden font-sans">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 italic text-[10px] text-slate-400 uppercase tracking-[0.25em]">
            <tr>
              <th className="px-10 py-6">Admission Token</th>
              <th className="px-10 py-6">Learner Registry</th>
              <th className="px-10 py-6">CBC Tracking</th>
              <th className="px-10 py-6">Contact Matrix</th>
              {role === 'headteacher' && <th className="px-10 py-6 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginatedStudents.map(s => (
              <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-10 py-6 font-mono text-xs font-black text-indigo-600 tracking-wider">#{s.admission_number}</td>
                <td className="px-10 py-6 font-black text-slate-800 tracking-tight">{s.name}</td>
                <td className="px-10 py-6 space-y-2">
                  <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 tracking-widest font-mono uppercase">{s.class}</span>
                  {s.upi_number && (
                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100">UPI: {s.upi_number}</span>
                  )}
                </td>
                <td className="px-10 py-6">
                  <div className="flex flex-col gap-1">
                    <p className="text-[11px] font-bold text-slate-400 flex items-center gap-2"><Send size={10} className="text-indigo-400" /> {s.parent_phone}</p>
                    {s.health_complications && (
                      <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1"><AlertTriangle size={10} /> Allergy/Health</p>
                    )}
                    {s.has_disability && (
                      <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1"><ShieldOff size={10} /> Disability</p>
                    )}
                    <p className="text-[9px] font-medium text-slate-300 italic truncate w-32">{s.parent_email || 'No email registered'}</p>
                  </div>
                </td>
                {role === 'headteacher' && (
                  <td className="px-10 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(s)} className="p-2 text-slate-300 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {filteredStudents.length === 0 && (
              <tr><td colSpan={5} className="px-10 py-20 text-center text-slate-300 italic font-medium">Registry empty. No CBC learners enrolled for current term matching your search.</td></tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
              <div className="h-1 w-12 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: `${(currentPage / totalPages) * 100}%` }}></div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 p-0 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 disabled:opacity-30"
              >
                <ChevronLeft size={18} />
              </Button>
              <Button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-10 h-10 p-0 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 disabled:opacity-30"
              >
                <ChevronRight size={18} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TeachersManagement = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [matrix, setMatrix] = useState<any>({});
  const [activeView, setActiveView] = useState<'roll' | 'matrix'>('roll');
  const [showAdd, setShowAdd] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    classes: [] as string[],
    subjects: [] as string[],
    teacher_role: 'Subject Teacher'
  });

  const fetchTeachers = async () => {
    const res = await fetch('/api/teachers', { credentials: 'include' });
    if (res.ok) setTeachers(await res.json());
  };

  const fetchMatrix = async () => {
    const res = await fetch('/api/teachers/allocation-matrix', { credentials: 'include' });
    if (res.ok) setMatrix(await res.json());
  };

  useEffect(() => {
    fetchTeachers();
    fetchMatrix();
  }, []);

  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.teacher_role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
  const paginatedTeachers = filteredTeachers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create assignment pairs from selected classes and subjects
    // (Existing multi-select UI maps all subjects to all classes for this teacher)
    const assignments = [];
    for (const c of formData.classes) {
      for (const s of formData.subjects) {
        assignments.push({ class: c, subject: s });
      }
    }

    const res = await fetch('/api/teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...formData, assignments })
    });
    if (res.ok) {
      fetchTeachers();
      fetchMatrix();
      setShowAdd(false);
      setFormData({ email: '', password: '', name: '', classes: [], subjects: [], teacher_role: 'Subject Teacher' });
      alert('Faculty member onboarded.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to permanently remove this teacher? This will also revoke their login access.')) return;
    const res = await fetch(`/api/teachers/${id}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) {
      fetchTeachers();
      fetchMatrix();
    }
  };

  const handleCheckboxChange = (type: 'classes' | 'subjects', value: string) => {
    setFormData(prev => {
      const current = prev[type];
      if (current.includes(value)) {
        return { ...prev, [type]: current.filter(i => i !== value) };
      } else {
        return { ...prev, [type]: [...current, value] };
      }
    });
  };

  const ALL_GRADES = [
    'Playgroup', 'PP1', 'PP2',
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6',
    'Grade 7 (JSS)', 'Grade 8 (JSS)', 'Grade 9 (JSS)'
  ];

  const ALL_SUBJECTS = [
    'Language Activities', 'Mathematical Activities', 'Environmental Activities',
    'Psycho-motor Activities', 'Religious Education', 'Creative Arts',
    'English', 'Kiswahili', 'Mathematics', 'Science & Tech',
    'Social Studies', 'CRE/IRE', 'Agriculture', 'Home Science',
    'Physical Education'
  ];

  const CLASS_ALL_SUBJECTS_MAP: Record<string, string[]> = {
    Playgroup: ['Language Activities', 'Mathematical Activities', 'Environmental Activities', 'Psycho-motor Activities', 'Religious Education', 'Creative Arts', 'Life Skills', 'Physical Education'],
    PP1: ['Language Activities', 'Mathematical Activities', 'Environmental Activities', 'Psycho-motor Activities', 'Religious Education', 'Creative Arts', 'Life Skills', 'Physical Education'],
    PP2: ['Language Activities', 'Mathematical Activities', 'Environmental Activities', 'Psycho-motor Activities', 'Religious Education', 'Creative Arts', 'Life Skills', 'Physical Education'],
    'Grade 1': ALL_SUBJECTS,
    'Grade 2': ALL_SUBJECTS,
    'Grade 3': ALL_SUBJECTS,
    'Grade 4': ALL_SUBJECTS,
    'Grade 5': ALL_SUBJECTS,
    'Grade 6': ALL_SUBJECTS,
    'Grade 7 (JSS)': ALL_SUBJECTS,
    'Grade 8 (JSS)': ALL_SUBJECTS,
    'Grade 9 (JSS)': ALL_SUBJECTS,
  };

  const getLearningAreasForClasses = (classes: string[]) => {
    return Array.from(new Set(classes.flatMap((c) => CLASS_ALL_SUBJECTS_MAP[c] || ALL_SUBJECTS)));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight text-slate-800">Faculty & CBC Allocation</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setActiveView('roll')}
              className={cn(
                "text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-xl transition-all",
                activeView === 'roll' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
              )}
            >
              Staff Roll
            </button>
            <button
              onClick={() => setActiveView('matrix')}
              className={cn(
                "text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-xl transition-all",
                activeView === 'matrix' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
              )}
            >
              Allocation Matrix
            </button>
          </div>
        </div>
        <div className="flex gap-4 print:hidden">
          <Button onClick={() => window.print()} className="bg-slate-50 text-slate-600 border border-slate-200 px-6 h-14 rounded-2xl flex items-center gap-2 hover:bg-slate-100 transition-all shadow-sm">
            <Printer size={20} />
          </Button>
          <Button onClick={() => setShowAdd(true)} className="bg-indigo-600 text-white flex items-center gap-3 px-8 h-14 rounded-2xl shadow-xl hover:bg-indigo-700 font-black text-xs uppercase tracking-widest">
            <Plus size={20} /> Onboard Faculty
          </Button>
        </div>
      </div>

      {showAdd && (
        <Card className="p-10 bg-white border-slate-100 shadow-2xl rounded-[2.5rem]">
          <form onSubmit={handleAdd} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Full Legal Name</label>
                <Input className="h-14 bg-slate-50 border-none rounded-xl font-bold" placeholder="Teacher Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Institutional Email</label>
                <Input className="h-14 bg-slate-50 border-none rounded-xl font-bold" type="email" placeholder="name@changara.edu" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Temporal Security Passkey</label>
                <div className="relative">
                  <Input
                    className="h-14 bg-slate-50 border-none rounded-xl font-bold pr-12"
                    type={showPassword ? "text" : "password"}
                    placeholder="Passkey for first login"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-colors pointer-events-auto cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Institutional Role</label>
                <select
                  className="w-full h-14 bg-slate-50 border-none rounded-xl font-bold px-4 outline-none focus:ring-2 focus:ring-indigo-600"
                  value={formData.teacher_role}
                  onChange={e => setFormData({ ...formData, teacher_role: e.target.value })}
                  required
                >
                  <option value="Subject Teacher">Subject Teacher (Standard)</option>
                  <option value="Class Teacher">Class Teacher (Full Management)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Assigned CBC Grades</label>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {[
                    { level: 'Foundation & Pre-Primary', grades: ['Playgroup', 'PP1', 'PP2'] },
                    { level: 'Lower/Upper Primary', grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'] },
                    { level: 'Junior Secondary (JSS)', grades: ['Grade 7', 'Grade 8', 'Grade 9'] }
                  ].map(group => (
                    <div key={group.level} className="space-y-2">
                      <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1 italic">{group.level}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {group.grades.map(grade => (
                          <button
                            key={grade}
                            type="button"
                            onClick={() => handleCheckboxChange('classes', grade)}
                            className={cn(
                              "px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-center border",
                              formData.classes.includes(grade)
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200"
                                : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-white hover:border-indigo-100"
                            )}
                          >
                            {grade}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Assigned Learning Areas</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ALL_SUBJECTS.map(subject => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => handleCheckboxChange('subjects', subject)}
                      className={cn(
                        "px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-center border",
                        formData.subjects.includes(subject)
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200"
                          : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-white hover:border-emerald-100"
                      )}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-slate-50">
              <Button type="submit" className="bg-indigo-600 text-white flex-1 h-16 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Activate Faculty Record</Button>
              <Button type="button" onClick={() => setShowAdd(false)} className="bg-slate-100 text-slate-500 px-12 h-16 rounded-2xl font-black text-xs uppercase tracking-widest">Dismiss</Button>
            </div>
          </form>
        </Card>
      )}

      {activeView === 'roll' ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {paginatedTeachers.map(t => (
              <Card key={t.id} className="p-8 space-y-6 bg-white border-slate-100 shadow-xl rounded-[2.5rem] group hover:shadow-2xl transition-all border hover:border-indigo-100">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-2xl shadow-inner group-hover:scale-105 transition-transform">
                    {t.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 justify-between">
                      <div className="flex items-baseline gap-2">
                        <p className="font-black text-slate-900 truncate tracking-tight text-lg leading-none mb-1">{t.name}</p>
                        <span className={cn(
                          "text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter border",
                          t.teacher_role === 'Class Teacher' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-indigo-50 text-indigo-600 border-indigo-100"
                        )}>
                          {t.teacher_role || 'Subject Teacher'}
                        </span>
                      </div>
                      <button onClick={() => handleDelete(t.id)} className="p-2 text-slate-200 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest truncate italic">{t.email}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest flex items-center gap-2">
                      <ChevronRight size={10} className="text-indigo-400" /> Assigned Grades
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {t.classes.map(c => <span key={c} className="bg-slate-50 px-3 py-1.5 rounded-lg text-[10px] font-black text-slate-500 border border-slate-200 tracking-wider font-mono uppercase">{c}</span>)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest flex items-center gap-2">
                      <ChevronRight size={10} className="text-indigo-400" /> Professional Focus
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {getLearningAreasForClasses(t.classes || []).map(s => <span key={s} className="bg-emerald-50 px-3 py-1.5 rounded-lg text-[10px] font-black text-emerald-600 border border-emerald-100 tracking-wider font-mono uppercase">{s}</span>)}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {filteredTeachers.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-300 italic font-medium">No faculty members detected matching your search.</div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between rounded-b-[2.5rem]">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
                <div className="h-1 w-12 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${(currentPage / totalPages) * 100}%` }}></div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 p-0 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 disabled:opacity-30 shadow-sm"
                >
                  <ChevronLeft size={16} />
                </Button>
                <Button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 p-0 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 disabled:opacity-30 shadow-sm"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card className="bg-white border border-slate-100 shadow-xl rounded-[3rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100 italic text-[10px] text-slate-400 uppercase tracking-[0.25em]">
                <tr>
                  <th className="px-8 py-6 sticky left-0 bg-slate-50 z-10 border-r border-slate-100 shadow-sm min-w-[200px]">CBC Grade Level</th>
                  {ALL_SUBJECTS.map(s => (
                    <th key={s} className="px-8 py-6 min-w-[180px] text-center border-r border-slate-100/30">{s}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-sans">
                {ALL_GRADES.map(grade => (
                  <tr key={grade} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6 sticky left-0 bg-white group-hover:bg-slate-50/50 z-10 border-r border-slate-100 shadow-sm font-black text-slate-700 tracking-tight text-sm">
                      {grade}
                    </td>
                    {ALL_SUBJECTS.map(subject => {
                      const assigned = matrix[grade]?.[subject] || [];
                      return (
                        <td key={subject} className="px-4 py-6 border-r border-slate-100/20">
                          <div className="flex flex-col items-center gap-2">
                            {assigned.length > 0 ? (
                              assigned.map((name: string) => (
                                <div key={name} className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tight border border-indigo-100 text-center w-full shadow-sm">
                                  {name}
                                </div>
                              ))
                            ) : (
                              <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic flex items-center gap-1 opacity-50">
                                <X size={10} /> Unassigned
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-8 bg-slate-50 border-t border-slate-100 italic flex items-center gap-4">
            <ShieldCheck className="text-emerald-500" size={24} />
            <p className="text-[10px] text-slate-400 font-bold leading-relaxed max-w-2xl">This matrix identifies the primary learning area facilitators per grade. Changes here require administrative review to maintain CBC curriculum fidelity and staff workload balance.</p>
          </div>
        </Card>
      )}
    </div>
  );
};

const FeesManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ student_id: '', amount: '', term: '', status: 'paid', food_type: '' });

  useEffect(() => {
    fetch('/api/students', { credentials: 'include' }).then(res => res.json()).then(setStudents);
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/fees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...formData, amount: parseFloat(formData.amount) })
    });
    if (res.ok) {
      setShowAdd(false);
      setFormData({ student_id: '', amount: '', term: '', status: 'paid', food_type: '' });
      alert('Bursary entry successfully committed.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black tracking-tight text-slate-800">Bursary & Financial Records</h2>
        <div className="flex gap-4">
          <Button onClick={() => window.print()} className="bg-slate-50 text-slate-600 border border-slate-200 px-6 py-4 rounded-2xl flex items-center gap-2 hover:bg-slate-100 transition-all shadow-sm print:hidden">
            <Printer size={20} /> Print Ledger
          </Button>
          <Button onClick={() => setShowAdd(true)} className="bg-emerald-600 text-white flex items-center gap-3 px-8 py-4 rounded-2xl shadow-xl hover:bg-emerald-700">
            <Plus size={20} /> Record New Receipt
          </Button>
        </div>
      </div>

      {showAdd && (
        <Card className="p-10 bg-white border-emerald-100 shadow-2xl rounded-[2.5rem]">
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Match CBC Learner</label>
              <select
                className="w-full h-14 px-4 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-emerald-600 font-black text-sm"
                value={formData.student_id}
                onChange={e => setFormData({ ...formData, student_id: e.target.value })}
                required
              >
                <option value="">Choose learner...</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.admission_number})</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">KSH Transaction Amount</label>
              <Input className="h-14 font-black text-xl" type="number" placeholder="Enter Amount" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Billing Term / Assessment Period</label>
              <Input className="h-14 font-bold" placeholder="e.g. 2024 CBC Evaluation Term 1" value={formData.term} onChange={e => setFormData({ ...formData, term: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Institutional Status</label>
              <select
                className="w-full h-14 px-4 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-emerald-600 font-black text-sm"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                required
              >
                <option value="paid">SETTLED (FULL)</option>
                <option value="pending">AWAITING (BAL)</option>
                <option value="partial">PRORATED (PARTIAL)</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Food / Supplies Type (Optional)</label>
              <Input className="h-14 font-bold" placeholder="e.g. Maize, Beans, Rice, etc." value={formData.food_type} onChange={e => setFormData({ ...formData, food_type: e.target.value })} />
            </div>
            <div className="md:col-span-2 flex gap-4 pt-6">
              <Button type="submit" className="bg-emerald-600 text-white flex-1 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Commit Transaction</Button>
              <Button type="button" onClick={() => setShowAdd(false)} className="bg-slate-100 text-slate-500 px-10 rounded-2xl font-bold text-xs uppercase tracking-widest">Discard Entry</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <Card className="col-span-1 md:col-span-3 p-12 bg-white border border-slate-100 shadow-2xl rounded-[3rem] flex items-center gap-12 group hover:border-emerald-100 transition-all">
          <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-emerald-600 shadow-inner border border-emerald-100 group-hover:rotate-6 transition-transform">
            <CreditCard size={44} />
          </div>
          <div className="space-y-4">
            <h3 className="text-3xl font-black text-slate-950 tracking-tighter">Bursary Management Sync</h3>
            <p className="text-slate-500 font-medium leading-relaxed italic max-w-xl border-l-4 border-slate-100 pl-6 text-sm">Changara Township financial ledger ensures all CBC tuition and special program activities are archived and instantly verifiable across administrative and parent-view dashboards.</p>
          </div>
        </Card>
        <Card className="p-10 bg-[#0f172a] text-white rounded-[2.5rem] shadow-2xl flex flex-col justify-between border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 relative_z-10">Bursary Health Rate</p>
          <div className="relative_z-10">
            <p className="text-6xl font-black tracking-tighter mb-4 group-hover:scale-105 transition-transform origin-left">92%</p>
            <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden border border-white/5 p-0.5">
              <div className="bg-emerald-500 h-full w-[92%] rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]"></div>
            </div>
          </div>
          <p className="text-[9px] font-bold text-slate-500 tracking-widest uppercase">Verified 2024 Cycle</p>
        </Card>
      </div>
    </div>
  );
};

const ExamsManagement = ({ role }: { role: string }) => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [examType, setExamType] = useState('End Term');
  const [term, setTerm] = useState(getCurrentAcademicTerm());
  const [year, setYear] = useState(getCurrentAcademicYear());
  const [results, setResults] = useState<any[]>([]);
  const [localEdits, setLocalEdits] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/students', { credentials: 'include' }).then(res => res.json()).then(setStudents);
    if ((user as any)?.teacherInfo?.classes?.length > 0) {
      setSelectedClass((user as any).teacherInfo.classes[0]);
    }
  }, [user]);

  const fetchExistingResults = async () => {
    if (!selectedClass) return;
    setLoading(true);
    const res = await fetch(`/api/exam-results?className=${encodeURIComponent(selectedClass)}&term=${encodeURIComponent(term)}&year=${encodeURIComponent(year)}&examType=${encodeURIComponent(examType)}`, { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      setResults(data || []);
      const edits: Record<number, any> = {};
      (data || []).forEach((row: any) => {
        edits[row.student_id] = { ...row };
      });
      setLocalEdits(edits);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchExistingResults();
  }, [selectedClass, term, year, examType]);

  const filteredStudents = students.filter(s => s.class === selectedClass);
  const currentAcademicSubjects = selectedClass ? getExamSubjectsForClass(selectedClass) : CBC_SUBJECTS;

  const handleLocalEdit = (studentId: number, field: string, value: any) => {
    setLocalEdits(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || results.find(r => r.student_id === studentId) || {}),
        [field]: value
      }
    }));
  };

  const handleSaveAll = async () => {
    if (!selectedClass) return;
    const payload = filteredStudents.map(student => {
      const row = localEdits[student.id] || results.find(r => r.student_id === student.id) || {};
      return {
        id: row?.id,
        student_id: student.id,
        class: selectedClass,
        exam_type: examType,
        term,
        year: parseInt(year, 10),
        math_marks: row.math_marks ?? null,
        english_marks: row.english_marks ?? null,
        kiswahili_marks: row.kiswahili_marks ?? null,
        science_marks: row.science_marks ?? null,
        social_studies_marks: row.social_studies_marks ?? null,
        creative_arts_marks: row.creative_arts_marks ?? null,
        religious_education_marks: row.religious_education_marks ?? null,
        life_skills_marks: row.life_skills_marks ?? null,
        physical_education_marks: row.physical_education_marks ?? null,
        agriculture_marks: row.agriculture_marks ?? null,
        remarks: row.remarks || '',
        updated_at: new Date().toISOString()
      };
    });

    setSaving(true);
    setMessage('Publishing class results...');
    const res = await fetch('/api/exam-results/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ results: payload })
    });
    if (res.ok) {
      setMessage('Results published. Parents can now view the new grades.');
      await fetchExistingResults();
    } else {
      const errData = await res.json().catch(() => ({}));
      setMessage(`Failed to publish results: ${errData.error || 'Unknown error'}`);
    }
    setSaving(false);
  };

  const handleDownloadCSV = () => {
    const headers = ['Admission Number', 'Learner', 'Class', 'Term', 'Assessment', ...currentAcademicSubjects.map(s => s.label), 'Remarks'];
    const rows = filteredStudents.map(student => {
      const row = localEdits[student.id] || results.find(r => r.student_id === student.id) || {};
      return [
        student.admission_number,
        student.name,
        selectedClass,
        term,
        examType,
        ...currentAcademicSubjects.map(subject => row[subject.key] ?? ''),
        row.remarks || ''
      ];
    });
    const csvContent = [headers, ...rows].map(r => r.map(String).map(v => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedClass}_${term}_${examType.replace(/\s+/g, '_')}_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePromoteClass = async () => {
    if (!selectedClass) return;
    if (examType !== 'End Term' || term !== 'Term 3') {
      setMessage('Promotions are available only after Term 3 End Term results.');
      return;
    }
    if (!confirm(`Promote all learners from ${selectedClass} to the next grade?`)) return;

    setPromoting(true);
    const res = await fetch('/api/students/promote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ className: selectedClass })
    });
    if (res.ok) {
      const data = await res.json();
      setMessage(`Learners promoted from ${data.from} to ${data.to}.`);
      fetch('/api/students', { credentials: 'include' }).then(res => res.json()).then(setStudents);
      setSelectedClass(data.to);
    } else {
      const errData = await res.json().catch(() => ({}));
      setMessage(`Promotion failed: ${errData.error || 'Unknown error'}`);
    }
    setPromoting(false);
  };

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter">CBC Academic Outcomes</h2>
            <p className="text-slate-500 font-medium italic">Official performance management and grading matrix for headteacher and class teacher entry.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 bg-slate-100 p-4 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl shadow-sm">
              <CalendarDays size={16} className="text-indigo-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{getFormattedToday()}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-white px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200 outline-none shadow-sm"
              >
                <option value="">Select Grade</option>
                {["Playgroup", "PP1", "PP2", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7 (JSS)", "Grade 8 (JSS)", "Grade 9 (JSS)"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="bg-white px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200 outline-none shadow-sm"
              >
                <option value="Beginning of Term">Opening Exams</option>
                <option value="Mid Term">Mid Term Assessment</option>
                <option value="End Term">End Term Exams</option>
              </select>
              <select value={term} onChange={e => setTerm(e.target.value)} className="bg-white px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200 outline-none shadow-sm">
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
              </select>
              <select value={year} onChange={e => setYear(e.target.value)} className="bg-white px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200 outline-none shadow-sm">
                <option value={getCurrentAcademicYear()}>{getCurrentAcademicYear()}</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
          </div>
        </div>
        {message && (
          <div className="rounded-3xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700">{message}</div>
        )}
      </div>

      {!selectedClass ? (
        <Card className="p-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] text-center">
          <BookOpen size={64} className="mx-auto text-slate-200 mb-6" />
          <p className="text-slate-400 font-black italic tracking-tight text-xl">Select a grade level to begin performance synchronization.</p>
        </Card>
      ) : (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row justify-between gap-4 items-stretch">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleSaveAll}
                  disabled={saving}
                  className="rounded-2xl bg-indigo-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save All Results'}
                </button>
                <button
                  onClick={handleDownloadCSV}
                  className="rounded-2xl bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-700 border border-slate-200 shadow-sm"
                >
                  Download CSV
                </button>
                <button
                  onClick={() => window.print()}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-slate-900/10"
                >
                  Print Report
                </button>
                {examType === 'End Term' && term === 'Term 3' && (
                  <button
                    onClick={handlePromoteClass}
                    disabled={promoting}
                    className="rounded-2xl bg-emerald-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {promoting ? 'Promoting...' : 'Promote Class'}
                  </button>
                )}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {loading ? 'Loading learners...' : `${filteredStudents.length} learners in ${selectedClass}`}
              </div>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 italic text-[10px] text-slate-400 uppercase tracking-[0.25em]">
                  <th className="px-10 py-6">Learner Record</th>
                  {currentAcademicSubjects.map(subject => (
                    <th key={subject.key} className="px-10 py-6 text-center">{subject.label}</th>
                  ))}
                  <th className="px-10 py-6">Teacher Remarks</th>
                  <th className="px-10 py-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents.map(student => {
                  const result = results.find(r => r.student_id === student.id);
                  const draft = localEdits[student.id] || result || {};
                  return (
                    <tr key={student.id} className="group hover:bg-slate-50/50 transition-all font-sans">
                      <td className="px-10 py-6">
                        <p className="font-black text-slate-800 tracking-tight">{student.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {student.admission_number}</p>
                      </td>
                      {currentAcademicSubjects.map(subject => (
                        <td key={subject.key} className="px-6 py-6 text-center">
                          <select
                            value={draft[subject.key] ?? ''}
                            className={cn(
                              "w-20 h-14 text-center font-black rounded-2xl border-none focus:ring-4 transition-all text-xs appearance-none cursor-pointer",
                              draft[subject.key] ? "bg-indigo-600 text-white shadow-lg" : "bg-slate-50 text-slate-400"
                            )}
                            onChange={(e) => handleLocalEdit(student.id, subject.key, e.target.value ? parseInt(e.target.value, 10) : null)}
                          >
                            <option value="">-</option>
                            <option value="100">EE</option>
                            <option value="75">ME</option>
                            <option value="50">AE</option>
                            <option value="25">BE</option>
                          </select>
                        </td>
                      ))}
                      <td className="px-10 py-6 min-w-[300px]">
                        <textarea
                          className="w-full h-12 bg-slate-50 rounded-xl px-4 py-2 border-none outline-none focus:ring-4 focus:ring-indigo-600/10 text-xs font-medium resize-none group-hover:h-24 transition-all"
                          placeholder="Teacher commentary..."
                          value={draft.remarks ?? ''}
                          onChange={(e) => handleLocalEdit(student.id, 'remarks', e.target.value)}
                        />
                      </td>
                      <td className="px-10 py-6 text-right">
                        {result ? (
                          <div className="flex flex-col items-end opacity-30 group-hover:opacity-100 transition-opacity">
                            <CheckCircle2 size={16} className="text-indigo-600 mb-1" />
                            <p className="text-[7px] font-black uppercase tracking-widest text-emerald-600">Published</p>
                          </div>
                        ) : Object.keys(draft).length > 0 ? (
                          <p className="text-[7px] font-black uppercase tracking-widest text-slate-500">Draft</p>
                        ) : (
                          <p className="text-[7px] font-black uppercase tracking-widest text-slate-400 italic">Awaiting Entry</p>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={currentAcademicSubjects.length + 3} className="px-10 py-20 text-center text-slate-300 italic font-medium">No learners enrolled in {selectedClass}.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex items-center gap-6">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm">
              <ShieldCheck size={24} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 italic max-w-2xl leading-relaxed uppercase tracking-wider">Note: All levels are auto-saved to the Master Ledger. Parents and Headteacher see updates instantly.</p>
          </div>
        </div>
      )}
    </div>
  );
};

const AnnouncementsManagement = ({ role }: { role?: string }) => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', type: 'General' });
  const announcementTextareaRef = useRef<HTMLTextAreaElement>(null);

  const isManagement = role === 'headteacher';

  const fetchAnnouncements = async () => {
    const res = await fetch('/api/public/announcements', { credentials: 'include' });
    if (res.ok) setAnnouncements(await res.json());
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleAnnouncementContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;
    setFormData({ ...formData, content: e.target.value });
    setTimeout(() => {
      if (announcementTextareaRef.current) {
        announcementTextareaRef.current.setSelectionRange(start, end);
      }
    }, 0);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = editingId ? `/api/comms/announcements/${editingId}` : '/api/comms/announcements';
    const method = editingId ? 'PATCH' : 'POST';

    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      setShowAdd(false);
      setEditingId(null);
      setFormData({ title: '', content: '', type: 'General' });
      fetchAnnouncements();
      alert(editingId ? 'Bulletin updated successfully.' : 'Institutional bulletin broadcast successfully.');
    }
  };

  const startEdit = (ann: any) => {
    setFormData({ title: ann.title, content: ann.content, type: ann.type });
    setEditingId(ann.id);
    setShowAdd(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this bulletin?')) return;
    const res = await fetch(`/api/comms/announcements/${id}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) fetchAnnouncements();
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black tracking-tight text-slate-800">Institutional Announcements</h2>
        {isManagement && !showAdd && (
          <Button onClick={() => setShowAdd(true)} className="bg-rose-600 text-white flex items-center gap-3 px-8 py-4 rounded-2xl shadow-xl hover:bg-rose-700 transition-all font-black text-[10px] uppercase tracking-widest">
            <Plus size={20} /> Publish News Item
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <Card className="p-10 bg-white border-2 border-rose-50 shadow-2xl rounded-[3rem]">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-slate-800">{editingId ? 'Edit News Perspective' : 'Draft New Bulletin'}</h3>
                <button onClick={() => { setShowAdd(false); setEditingId(null); }} className="text-slate-400 hover:text-rose-600 transition-colors">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAdd} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Headline</label>
                    <Input className="h-14 font-bold" placeholder="Notice Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Bulletin Type</label>
                    <select
                      className="w-full h-14 px-6 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-rose-500 font-bold"
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="General">General Notice</option>
                      <option value="Alert">Urgent Alert</option>
                      <option value="Event">Upcoming Event</option>
                      <option value="Holiday">School Holiday</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Detailed Content</label>
                  <textarea
                    ref={announcementTextareaRef}
                    className="w-full h-40 p-6 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                    placeholder="Enter announcement details..."
                    value={formData.content}
                    onChange={handleAnnouncementContentChange}
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <Button type="submit" className="flex-1 h-14 bg-rose-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest">{editingId ? 'Update Broadcast' : 'Broadcast Announcement'}</Button>
                  <Button type="button" onClick={() => { setShowAdd(false); setEditingId(null); }} className="h-14 px-8 bg-slate-100 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest">Discard</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {announcements.map(ann => (
          <Card key={ann.id} className="p-8 bg-white border border-slate-100 shadow-xl rounded-[2.5rem] relative overflow-hidden group hover:shadow-2xl transition-all">
            <div className={cn(
              "absolute top-0 left-0 w-2 h-full",
              ann.type === 'Alert' ? "bg-rose-500" : ann.type === 'Holiday' ? "bg-amber-500" : "bg-indigo-500"
            )}></div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[9px] font-black bg-slate-50 text-slate-400 px-3 py-1 rounded-md border border-slate-100 uppercase tracking-widest mb-3 inline-block">
                  {ann.type}
                </span>
                <h4 className="text-xl font-black text-slate-800 tracking-tight leading-none">{ann.title}</h4>
              </div>
              <div className="flex flex-col items-end gap-2">
                <p className="text-[10px] font-bold text-slate-400 italic">{new Date(ann.created_at).toLocaleDateString()}</p>
                {isManagement && (
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(ann)} className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(ann.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed font-medium text-sm line-clamp-3">{ann.content}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

const MessagesManagement = () => {
  const [content, setContent] = useState('');
  const [targetClass, setTargetClass] = useState('All Parents');
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [parentsList, setParentsList] = useState<any[]>([]);
  const [searchParent, setSearchParent] = useState('');
  const [parentPage, setParentPage] = useState(1);
  const [editingMessage, setEditingMessage] = useState<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const parentsPerPage = 10;

  const fetchHistory = async () => {
    const res = await fetch('/api/messages', { credentials: 'include' });
    if (res.ok) setHistory(await res.json());
  };

  const fetchParentsForClass = async () => {
    if (targetClass === 'All Parents') {
      setParentsList([]);
      return;
    }
    const res = await fetch(`/api/students?class=${encodeURIComponent(targetClass)}`, { credentials: 'include' });
    if (res.ok) {
      const students = await res.json();
      // Extract unique parents (by phone/email)
      const uniqueParents: any[] = [];
      const seen = new Set();
      students.forEach((s: any) => {
        if (!seen.has(s.parent_phone)) {
          seen.add(s.parent_phone);
          uniqueParents.push({
            studentName: s.name,
            parentName: s.parent_name || 'Guardian',
            phone: s.parent_phone,
            email: s.parent_email
          });
        }
      });
      setParentsList(uniqueParents);
    }
  };

  useEffect(() => { fetchHistory(); }, []);
  useEffect(() => {
    setParentPage(1);
    fetchParentsForClass();
  }, [targetClass]);

  const sanitizeInput = (str: string) => {
    return str.replace(/[<>]/g, '').trim();
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;
    setContent(e.target.value);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(start, end);
      }
    }, 0);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic rate limiting check (30 seconds between messages)
    const lastSent = localStorage.getItem('last_message_sent');
    const now = Date.now();
    if (lastSent && now - parseInt(lastSent) < 30000) {
      alert('Security Protocol: Message frequency exceeded. Please wait 30 seconds before next transmission.');
      return;
    }

    const sanitizedContent = sanitizeInput(content);
    if (!sanitizedContent) {
      alert('Payload content is invalid or empty.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = targetClass === 'All Parents' ? '/api/messages/bulk' : '/api/messages/send-to-class';
      const body = targetClass === 'All Parents'
        ? { content: sanitizedContent }
        : { className: targetClass, content: sanitizedContent };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (res.ok) {
        setContent('');
        localStorage.setItem('last_message_sent', now.toString());
        fetchHistory();
        alert(data.message || 'Transmission initiated via Official Secure Gateway.');
      } else {
        alert(`Transmission failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      alert('Network error occurred during transmission.');
    } finally {
      setLoading(false);
    }
  };

  const filteredParents = parentsList.filter(p =>
    p.parentName.toLowerCase().includes(searchParent.toLowerCase()) ||
    p.studentName.toLowerCase().includes(searchParent.toLowerCase()) ||
    p.phone.includes(searchParent)
  );

  const totalParentPages = Math.ceil(filteredParents.length / parentsPerPage);
  const paginatedParents = filteredParents.slice((parentPage - 1) * parentsPerPage, parentPage * parentsPerPage);

  const classes = [
    "Playgroup", "PP1", "PP2",
    "Grade 1", "Grade 2", "Grade 3",
    "Grade 4", "Grade 5", "Grade 6",
    "Grade 7 (JSS)", "Grade 8 (JSS)", "Grade 9 (JSS)",
    "Grade 10", "Grade 11", "Grade 12"
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight text-slate-800">Communication & Outreach Hub</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Synchronized institutional messaging active</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full uppercase tracking-widest flex items-center gap-2 animate-pulse">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
            System Online
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <Card className="xl:col-span-2 p-10 bg-white border border-slate-100 shadow-2xl rounded-[3rem]">
          <form onSubmit={handleSend} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Target Audience</label>
                <select
                  className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-none outline-none focus:ring-4 focus:ring-indigo-600/10 font-bold text-slate-800 transition-all shadow-inner"
                  value={targetClass}
                  onChange={(e) => setTargetClass(e.target.value)}
                  required
                >
                  <option value="All Parents">Global Broadcast (All Parents)</option>
                  <optgroup label="Filter by Professional CBC Grade">
                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                  </optgroup>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Protocol Identification</label>
                <div className="h-14 px-6 rounded-2xl bg-slate-50 flex flex-col justify-center font-bold text-slate-400 italic text-[10px] shadow-inner overflow-hidden">
                  <p>SenderID: {targetClass === 'All Parents' ? 'GLOBAL_OUTREACH' : `GRADE_${targetClass.replace(/\s+/g, '').toUpperCase()}`}</p>
                  <p className="text-[8px] text-indigo-400 opacity-60">Use 'sandbox' or leave empty if not registered.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">SMS Transmission Payload</label>
              <textarea
                ref={textareaRef}
                className="w-full h-48 p-8 rounded-[2rem] bg-slate-50 border-none outline-none focus:ring-4 focus:ring-indigo-600/10 font-bold text-slate-800 transition-all resize-none shadow-inner"
                placeholder={`Type information for ${targetClass}...`}
                value={content}
                onChange={handleContentChange}
                required
              />
              <div className="flex justify-between items-center px-4">
                <div className="flex items-center gap-4">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Segments: {Math.ceil(content.length / 160) || 1}</p>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">{content.length} Characters</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure Institutional Delivery</p>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || content.length < 5}
              className="w-full bg-slate-900 text-white flex items-center justify-center gap-4 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-black transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowUpRight size={20} />}
              {loading ? "Transmitting to Gateway..." : `Release Message to ${targetClass}`}
            </Button>
          </form>

          {targetClass !== 'All Parents' && parentsList.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 pt-10 border-t border-slate-50"
            >
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Recipient Portfolio: {targetClass}</h3>
                  <p className="text-[10px] font-bold text-slate-400 italic">Verified parents for currently selected CBC unit</p>
                </div>
                <div className="relative group w-full md:w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                  <Input
                    placeholder="Search recipients..."
                    className="pl-10 h-10 bg-slate-50 border-none rounded-xl text-[10px] font-bold"
                    value={searchParent}
                    onChange={(e) => { setSearchParent(e.target.value); setParentPage(1); }}
                  />
                </div>
              </div>

              <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paginatedParents.map((p, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 text-[10px] font-black">
                          {p.parentName[0]}
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-slate-800">{p.parentName}</p>
                          <p className="text-[9px] font-bold text-slate-400">Parent of {p.studentName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-mono font-bold text-slate-500">{p.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {paginatedParents.length === 0 && (
                  <p className="text-center py-10 italic text-slate-400 text-xs font-medium">No recipients match your search probe.</p>
                )}
              </div>

              {totalParentPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Page {parentPage} of {totalParentPages}</p>
                  <div className="flex gap-2">
                    <Button onClick={() => setParentPage(p => Math.max(1, p - 1))} disabled={parentPage === 1} className="w-8 h-8 p-0 rounded-lg bg-white border border-slate-200 text-slate-400 disabled:opacity-30"><ChevronLeft size={14} /></Button>
                    <Button onClick={() => setParentPage(p => Math.min(totalParentPages, p + 1))} disabled={parentPage === totalParentPages} className="w-8 h-8 p-0 rounded-lg bg-white border border-slate-200 text-slate-400 disabled:opacity-30"><ChevronRight size={14} /></Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </Card>

        <Card className="p-10 bg-slate-50 border border-slate-200 border-dashed rounded-[3rem] space-y-8">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Archive Logs</h3>
            <Printer size={16} className="text-slate-300 cursor-pointer hover:text-indigo-600" onClick={() => window.print()} />
          </div>
          <div className="space-y-6 overflow-auto max-h-[600px] pr-4 subtle-scrollbar">
            {history.length === 0 ? (
              <p className="text-slate-400 text-center py-10 italic font-medium">No transmission history detected.</p>
            ) : (
              history.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((msg: any) => (
                <div key={msg.id} className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3 group hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200 uppercase tracking-widest">
                      To: {msg.receiver_type.replace('class_', '').replace('_', ' ')}
                    </span>
                    <p className="text-[8px] font-bold text-slate-300 font-mono italic">{new Date(msg.created_at).toLocaleTimeString()}</p>
                  </div>
                  <p className="text-[11px] text-slate-800 leading-relaxed font-bold">{msg.content}</p>
                  <div className="flex justify-between items-end mt-1">
                    {msg.status === 'failed' ? (
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1">
                          <XCircle size={10} /> Transmission Failed
                        </p>
                        {msg.error_message && <p className="text-[8px] text-rose-300 italic max-w-[150px] leading-tight">{msg.error_message}</p>}
                      </div>
                    ) : (
                      <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                        <ShieldCheck size={10} /> Delivery Confirmed
                      </p>
                    )}
                    <p className="text-[9px] font-bold text-slate-300 italic">{new Date(msg.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

// --- Main App ---
export default function App() {
  const [view, setView] = useState<'landing' | 'auth'>('landing');

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <AuthContext.Consumer>
              {({ user, loading }) => {
                if (loading) return null;
                if (user) return <Navigate to="/dashboard" />;
                return view === 'landing'
                  ? <LandingPage onGoToLogin={() => setView('auth')} />
                  : <AuthPage onBack={() => setView('landing')} />;
              }}
            </AuthContext.Consumer>
          } />
          <Route path="/dashboard" element={<DashboardShell />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
