import { useEffect, useState } from 'react';
import { BookOpen, CalendarDays, ClipboardCheck, FileText, GraduationCap, LogOut, Trophy, UserRound } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { getStudentSession, logoutStudent, StudentSessionProfile } from '@/lib/tuitionStudents';

export default function TuitionStudentDashboard() {
  const { navigate } = useRouter();
  const [student, setStudent] = useState<StudentSessionProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentSession().then((profile) => {
      setStudent(profile);
      setLoading(false);
      if (!profile) navigate('tuition-student-login');
    });
  }, [navigate]);

  const logout = async () => {
    await logoutStudent();
    navigate('tuition-student-login');
  };

  if (loading) return <main className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-500">Loading your dashboard…</main>;
  if (!student) return null;

  const cards = [
    { title: 'My Course', text: student.course || 'Course not assigned yet', icon: BookOpen, action: () => navigate('tuition-courses') },
    { title: 'Classroom', text: 'View your scheduled live classes and meeting links.', icon: CalendarDays, action: () => navigate('tuition-student-classes') },
    { title: 'Attendance', text: 'View attendance recorded by your tutor.', icon: ClipboardCheck, action: () => navigate('tuition-student-classes') },
    { title: 'Materials', text: 'Open your course page to access published learning materials.', icon: FileText, action: () => navigate('tuition-courses') },
    { title: 'Competitions', text: 'Join VATTAMS Academy competitions.', icon: Trophy, action: () => navigate('academy-competitions') },
    { title: 'Profile', text: `${student.city} • ${student.class_mode}`, icon: UserRound, action: () => undefined },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-indigo-300 text-xs font-bold uppercase tracking-[0.18em]">VATTAMS Academy • Student</p>
              <h1 className="text-3xl md:text-4xl font-black mt-2">Welcome, {student.student_name}</h1>
              <p className="text-slate-300 mt-2">{student.student_id ?? 'Student ID will be assigned after approval'} • {student.email}</p>
            </div>
            <button type="button" onClick={logout} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold hover:bg-white/15"><LogOut size={17} /> Sign Out</button>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((card) => {
            const Icon = card.icon;
            return <button type="button" key={card.title} onClick={card.action} className="text-left w-full bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:border-indigo-300 hover:shadow-md transition">
              <div className="h-11 w-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5"><Icon size={21} /></div>
              <h2 className="font-extrabold text-lg">{card.title}</h2>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">{card.text}</p>
            </button>;
          })}
        </div>

        <div className="mt-8 bg-white border border-slate-200 rounded-3xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-3"><GraduationCap className="text-indigo-600" /><h2 className="text-xl font-black">Your learning journey</h2></div>
          <p className="text-sm text-slate-600 leading-relaxed">Published course materials are now available from the relevant course page. Your classroom, attendance, assignments, tests, competitions and certificates will continue to appear as they are assigned to your account.</p>
          <button type="button" onClick={() => navigate('tuition-courses')} className="mt-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 text-sm font-extrabold">Explore Courses</button>
        </div>
      </section>
    </main>
  );
}
