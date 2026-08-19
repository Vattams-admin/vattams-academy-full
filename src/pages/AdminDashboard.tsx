import { useEffect, useState } from 'react';
import {
  BookOpen,
  GraduationCap,
  LogOut,
  ShieldCheck,
  Trophy,
  Award,
  Users,
  UserCheck,
} from 'lucide-react';
import { useRouter } from '@/lib/router';
import TuitionAdminPanel from '@/components/tuition/admin/TuitionAdminPanel';

export default function AdminDashboard() {
  const { navigate } = useRouter();
  const [checking, setChecking] = useState(true);
  const [adminName, setAdminName] = useState('Academy Admin');

  useEffect(() => {
    const token = sessionStorage.getItem('vattams_admin_token');
    const expires = sessionStorage.getItem('vattams_admin_expires');

    if (!token || (expires && new Date(expires) < new Date())) {
      sessionStorage.removeItem('vattams_admin');
    sessionStorage.removeItem('vattams_admin_token');
      sessionStorage.removeItem('vattams_admin_email');
      sessionStorage.removeItem('vattams_admin_expires');
      sessionStorage.removeItem('vattams_admin_role');
      sessionStorage.removeItem('vattams_admin_name');
      navigate('admin-login');
      return;
    }

    setAdminName(sessionStorage.getItem('vattams_admin_name') || 'Academy Admin');
    setChecking(false);
  }, [navigate]);

  const logout = () => {
    sessionStorage.removeItem('vattams_admin');
    sessionStorage.removeItem('vattams_admin_token');
    sessionStorage.removeItem('vattams_admin_email');
    sessionStorage.removeItem('vattams_admin_expires');
    sessionStorage.removeItem('vattams_admin_role');
    sessionStorage.removeItem('vattams_admin_name');
    navigate('admin-login');
  };

  if (checking) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
      </main>
    );
  }

  const quickLinks = [
    { label: 'Students', description: 'Review registrations and student status.', icon: Users, action: () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }) },
    { label: 'Tutors', description: 'Review tutor applications and approvals.', icon: UserCheck, action: () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }) },
    { label: 'Courses', description: 'Manage the Academy course catalogue.', icon: BookOpen, action: () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }) },
    { label: 'Competitions', description: 'Open the public competition area.', icon: Trophy, action: () => navigate('academy-competitions') },
    { label: 'Certificates', description: 'Open certificate verification.', icon: Award, action: () => navigate('academy-certificates') },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/vattams-academy-mark.svg" alt="VATTAMS Academy" className="h-10 w-10 rounded-xl" />
            <div className="min-w-0">
              <h1 className="font-black text-slate-900 truncate">VATTAMS Academy</h1>
              <p className="text-xs text-slate-500 truncate">Administration Console</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <ShieldCheck size={14} className="text-emerald-600" />
              {adminName}
            </span>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-9 md:py-12">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
              <GraduationCap size={25} />
            </div>
            <div>
              <p className="text-indigo-300 text-xs font-black uppercase tracking-[0.18em]">Academy Control Centre</p>
              <h2 className="text-2xl md:text-4xl font-black mt-2">Welcome, {adminName}</h2>
              <p className="text-slate-300 text-sm md:text-base mt-2 max-w-2xl">
                Manage students, tutors, courses, trials, classrooms, attendance and learning operations from one Academy dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-7">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {quickLinks.map(({ label, description, icon: Icon, action }) => (
            <button
              key={label}
              type="button"
              onClick={action}
              className="text-left bg-white border border-slate-200 rounded-2xl p-4 hover:border-indigo-300 hover:shadow-sm transition"
            >
              <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Icon size={18} />
              </div>
              <h3 className="font-extrabold text-sm mt-3">{label}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-12">
        <TuitionAdminPanel />
      </section>
    </main>
  );
}
