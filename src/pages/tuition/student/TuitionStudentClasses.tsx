import { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle2, ExternalLink, RefreshCw, Video } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { getStudentSession, StudentSessionProfile } from '@/lib/tuitionStudents';
import { listClasses, ClassroomRecord, getAttendance } from '@/lib/tuitionClassroom';

export default function TuitionStudentClasses() {
  const { navigate } = useRouter();
  const [student, setStudent] = useState<StudentSessionProfile | null>(null);
  const [classes, setClasses] = useState<ClassroomRecord[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try { const profile = await getStudentSession(); if (!profile) { navigate('tuition-student-login'); return; } setStudent(profile); const result = await listClasses('student'); setClasses(result.classes); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to load your classes.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const viewAttendance = async (cls: ClassroomRecord) => {
    try { const rows = await getAttendance(cls.id, 'student'); const mine = rows.find((r: any) => r.student_id === student?.id); setAttendance(prev => ({...prev, [cls.id]: mine?.status || 'Not marked'})); } catch { setAttendance(prev => ({...prev, [cls.id]: 'Not available'})); }
  };

  if (loading) return <main className="min-h-screen flex items-center justify-center bg-slate-50 text-sm text-slate-500">Loading your classroom…</main>;
  if (!student) return null;
  return <main className="min-h-screen bg-slate-50 text-slate-900"><section className="bg-slate-950 text-white"><div className="max-w-6xl mx-auto px-4 py-9"><p className="text-indigo-300 text-xs font-bold uppercase tracking-[0.18em]">VATTAMS Academy • Student</p><h1 className="text-3xl font-black mt-2">My Classroom</h1><p className="text-slate-300 mt-2">{student.student_name} • {classes.length} class{classes.length === 1 ? '' : 'es'}</p></div></section><section className="max-w-6xl mx-auto px-4 py-7"><div className="flex justify-end mb-4"><button onClick={load} className="inline-flex gap-2 items-center rounded-xl border bg-white px-3 py-2 text-sm font-bold"><RefreshCw size={15}/> Refresh</button></div>{error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}{classes.length === 0 ? <div className="rounded-2xl bg-white border border-dashed p-10 text-center"><CalendarDays className="mx-auto text-indigo-500"/><p className="font-bold mt-3">No classes assigned yet.</p><p className="text-sm text-slate-500 mt-1">Your tutor/admin will add your classes here.</p></div> : <div className="grid md:grid-cols-2 gap-4">{classes.map(c => <article key={c.id} className="bg-white rounded-2xl border p-5"><p className="text-xs font-bold text-indigo-600 uppercase">{c.courseName}</p><h2 className="font-black text-lg mt-1">{c.subject}</h2><p className="text-sm text-slate-500 mt-2">{c.date} • {c.startTime}–{c.endTime} • {c.classGrade}</p><p className="text-sm mt-3"><span className="text-slate-400">Tutor:</span> <b>{c.tutorName}</b></p><div className="flex flex-wrap gap-2 mt-4">{c.meetingUrl && <a href={c.meetingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white px-3 py-2 text-sm font-bold"><Video size={15}/> Join Classroom <ExternalLink size={13}/></a>}<button onClick={() => viewAttendance(c)} className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold"><CheckCircle2 size={15}/> Attendance</button></div>{attendance[c.id] && <p className="mt-3 text-sm font-bold text-slate-600">Your attendance: <span className="text-indigo-600">{attendance[c.id]}</span></p>}</article>)}</div>}</section></main>;
}
