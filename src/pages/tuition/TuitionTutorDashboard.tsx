import { useEffect, useState } from 'react';
import { BookOpen, CalendarDays, CheckCircle2, ClipboardCheck, FileText, GraduationCap, LogOut, Users, Video } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { getTutorSession, logoutTutor, TutorSessionProfile } from '@/lib/tuitionTutorAuth';

export default function TuitionTutorDashboard() {
  const { navigate } = useRouter();
  const [tutor, setTutor] = useState<TutorSessionProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { let active = true; getTutorSession().then((profile) => { if (!active) return; if (!profile) { navigate('tuition-tutor-login'); return; } setTutor(profile); setLoading(false); }); return () => { active = false; }; }, [navigate]);
  const logout = async () => { await logoutTutor(); navigate('tuition-tutor-login'); };
  if (loading) return <main className="min-h-screen flex items-center justify-center bg-slate-50"><div className="h-10 w-10 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"/></main>;
  if (!tutor) return null;

  const cards = [
    ['My Courses', 'Manage your assigned courses and learning plans.', BookOpen],
    ['My Students', 'View students assigned to your teaching schedule.', Users],
    ['Upcoming Classes', 'See your class schedule and online sessions.', CalendarDays],
    ['Classroom', 'Open your online classroom when a class is scheduled.', Video],
    ['Attendance', 'Record and review attendance for your classes.', ClipboardCheck],
    ['Materials', 'Access and organise approved course materials.', FileText],
  ] as const;

  return <main className="min-h-screen bg-slate-50 text-slate-900">
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200"><div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3"><div className="flex items-center gap-3 min-w-0"><div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><GraduationCap size={21}/></div><div className="min-w-0"><p className="font-black truncate">VATTAMS Academy</p><p className="text-xs text-slate-500 truncate">Tutor Dashboard</p></div></div><button type="button" onClick={logout} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-bold"><LogOut size={15}/> Logout</button></div></header>
    <section className="bg-slate-950 text-white"><div className="max-w-7xl mx-auto px-4 py-8 md:py-10"><p className="text-indigo-300 text-xs font-bold uppercase tracking-[0.18em]">Tutor Portal</p><h1 className="text-2xl md:text-4xl font-black mt-2">Welcome, {tutor.full_name}</h1><div className="flex flex-wrap gap-2 mt-4 text-xs"><span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/15 text-green-200 px-3 py-1.5"><CheckCircle2 size={14}/> Approved Tutor</span>{tutor.employee_id && <span className="rounded-full bg-white/10 px-3 py-1.5">Tutor ID: {tutor.employee_id}</span>}</div></div></section>
    <section className="max-w-7xl mx-auto px-4 py-8"><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{cards.map(([title, description, Icon]) => <button key={title} type="button" onClick={() => title === 'Upcoming Classes' || title === 'Classroom' || title === 'Attendance' ? navigate('tuition-tutor-classes') : undefined} className="text-left bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-sm transition"><div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Icon size={19}/></div><h2 className="font-extrabold mt-4">{title}</h2><p className="text-sm text-slate-500 mt-1 leading-relaxed">{description}</p></button>)}</div>
      <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-5"><h2 className="font-extrabold text-lg">Profile</h2><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 text-sm"><div><p className="text-slate-400">Email</p><p className="font-semibold mt-1">{tutor.email}</p></div><div><p className="text-slate-400">Phone</p><p className="font-semibold mt-1">{tutor.phone}</p></div><div><p className="text-slate-400">Location</p><p className="font-semibold mt-1">{tutor.city}{tutor.state ? `, ${tutor.state}` : ''}</p></div><div><p className="text-slate-400">Qualification</p><p className="font-semibold mt-1">{tutor.highest_qualification}</p></div><div><p className="text-slate-400">Teaching Mode</p><p className="font-semibold mt-1">{tutor.teaching_mode || 'Online'}</p></div><div><p className="text-slate-400">Subjects</p><p className="font-semibold mt-1">{tutor.subjects.length ? tutor.subjects.join(', ') : 'Not specified'}</p></div></div></div>
    </section>
  </main>;
}
