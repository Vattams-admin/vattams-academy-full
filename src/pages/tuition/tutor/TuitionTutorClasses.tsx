import { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle2, ExternalLink, RefreshCw, Save, Video } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { getTutorSession, TutorSessionProfile } from '@/lib/tuitionTutorAuth';
import { listClasses, saveAttendance, ClassroomRecord, AttendanceStatus } from '@/lib/tuitionClassroom';

export default function TuitionTutorClasses() {
  const { navigate } = useRouter();
  const [tutor, setTutor] = useState<TutorSessionProfile | null>(null);
  const [classes, setClasses] = useState<ClassroomRecord[]>([]);
  const [selected, setSelected] = useState<ClassroomRecord | null>(null);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try { const profile = await getTutorSession(); if (!profile) { navigate('tuition-tutor-login'); return; } setTutor(profile); const result = await listClasses('tutor'); setClasses(result.classes); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to load your classes.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const markAll = (status: AttendanceStatus) => {
    if (!selected) return;
    const next: Record<string, AttendanceStatus> = {};
    selected.students.forEach(s => { next[s.id] = status; });
    setAttendance(next);
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true); setError('');
    try {
      await saveAttendance(selected.id, selected.students.map(s => ({ studentId: s.id, status: attendance[s.id] || 'not-marked' })), 'tutor');
      await load();
      setSelected(null);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to save attendance.'); }
    finally { setSaving(false); }
  };

  if (loading) return <main className="min-h-screen flex items-center justify-center bg-slate-50 text-sm text-slate-500">Loading your classroom…</main>;
  if (!tutor) return null;

  return <main className="min-h-screen bg-slate-50 text-slate-900"><section className="bg-slate-950 text-white"><div className="max-w-6xl mx-auto px-4 py-9"><p className="text-indigo-300 text-xs font-bold uppercase tracking-[0.18em]">VATTAMS Academy • Tutor</p><h1 className="text-3xl font-black mt-2">My Classes</h1><p className="text-slate-300 mt-2">{tutor.full_name} • {classes.length} assigned class{classes.length === 1 ? '' : 'es'}</p></div></section><section className="max-w-6xl mx-auto px-4 py-7"><div className="flex justify-end mb-4"><button onClick={load} className="inline-flex gap-2 items-center rounded-xl border bg-white px-3 py-2 text-sm font-bold"><RefreshCw size={15}/> Refresh</button></div>{error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}{classes.length === 0 ? <div className="rounded-2xl bg-white border border-dashed p-10 text-center"><CalendarDays className="mx-auto text-indigo-500"/><p className="font-bold mt-3">No classes assigned yet.</p></div> : <div className="grid md:grid-cols-2 gap-4">{classes.map(c => <article key={c.id} className="bg-white rounded-2xl border p-5"><div className="flex justify-between gap-3"><div><p className="text-xs font-bold text-indigo-600 uppercase">{c.courseName}</p><h2 className="font-black text-lg mt-1">{c.subject}</h2></div><span className="text-xs font-bold rounded-full bg-slate-100 px-2.5 py-1 h-fit">{c.status}</span></div><p className="text-sm text-slate-500 mt-2">{c.date} • {c.startTime}–{c.endTime} • {c.classGrade}</p><p className="text-sm font-semibold mt-3">{c.students.length} student{c.students.length === 1 ? '' : 's'}</p><div className="flex flex-wrap gap-2 mt-4"><button onClick={() => { setSelected(c); const a: Record<string, AttendanceStatus> = {}; c.students.forEach(s => a[s.id] = 'not-marked'); setAttendance(a); }} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white px-3 py-2 text-sm font-bold"><CheckCircle2 size={15}/> Take Attendance</button>{c.meetingUrl && <a href={c.meetingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold"><Video size={15}/> Join</a>}</div></article>)}</div>}</section>{selected && <div className="fixed inset-0 z-50 bg-slate-950/60 p-4 flex items-center justify-center"><div className="w-full max-w-lg rounded-3xl bg-white p-6 max-h-[90vh] overflow-y-auto"><div className="flex justify-between"><div><h2 className="text-xl font-black">Attendance</h2><p className="text-sm text-slate-500">{selected.subject} • {selected.date}</p></div><button onClick={() => setSelected(null)}>✕</button></div><div className="flex gap-2 mt-5"><button onClick={() => markAll('present')} className="rounded-lg bg-emerald-50 text-emerald-700 px-3 py-2 text-xs font-bold">All Present</button><button onClick={() => markAll('absent')} className="rounded-lg bg-red-50 text-red-700 px-3 py-2 text-xs font-bold">All Absent</button><button onClick={() => markAll('late')} className="rounded-lg bg-amber-50 text-amber-700 px-3 py-2 text-xs font-bold">All Late</button></div><div className="space-y-3 mt-5">{selected.students.map(s => <div key={s.id} className="flex items-center justify-between gap-3 border rounded-xl p-3"><span className="font-semibold text-sm">{s.name}</span><select value={attendance[s.id] || 'not-marked'} onChange={e => setAttendance({...attendance, [s.id]: e.target.value as AttendanceStatus})} className="rounded-lg border px-2 py-2 text-sm"><option value="not-marked">Not marked</option><option value="present">Present</option><option value="late">Late</option><option value="absent">Absent</option></select></div>)}</div><button disabled={saving} onClick={save} className="mt-6 w-full inline-flex justify-center items-center gap-2 rounded-xl bg-indigo-600 text-white py-3 font-bold"><Save size={17}/> {saving ? 'Saving…' : 'Save Attendance'}</button></div></div>}</main>;
}
