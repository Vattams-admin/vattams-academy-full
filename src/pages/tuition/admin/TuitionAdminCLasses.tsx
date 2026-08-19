import { useEffect, useState } from 'react';
import { CalendarDays, ExternalLink, Plus, RefreshCw, Users, X } from 'lucide-react';
import { listClasses, createClass, ClassroomRecord } from '@/lib/tuitionClassroom';
import { tuitionCourses } from '@/pages/tuition/tuitionCoursesData';

interface TutorOption { id: string; full_name: string; }
interface StudentOption { id: string; student_name: string; }

export default function TuitionAdminClasses() {
  const [classes, setClasses] = useState<ClassroomRecord[]>([]);
  const [tutors, setTutors] = useState<TutorOption[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [form, setForm] = useState({ courseId: '', subject: '', classGrade: '', board: '', tutorId: '', date: '', startTime: '', endTime: '', mode: 'online', meetingProvider: 'google-meet', meetingUrl: '' });

  const load = async () => {
    setLoading(true); setError('');
    try {
      const result = await listClasses('admin');
      setClasses(result.classes);
      setTutors(result.tutors ?? []);
      setStudents(result.students ?? []);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load classes.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const selectedCourse = tuitionCourses.find((c) => c.slug === form.courseId);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); if (saving) return;
    setSaving(true); setError('');
    try {
      await createClass({ ...form, courseName: selectedCourse?.name || form.courseId, studentIds: selectedStudents });
      setShowCreate(false); setSelectedStudents([]);
      setForm({ courseId: '', subject: '', classGrade: '', board: '', tutorId: '', date: '', startTime: '', endTime: '', mode: 'online', meetingProvider: 'google-meet', meetingUrl: '' });
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not create class.'); }
    finally { setSaving(false); }
  };

  return <div>
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div><h3 className="text-xl font-black">Classroom</h3><p className="text-sm text-slate-500">Create and manage real online classes.</p></div>
      <div className="flex gap-2"><button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold"><RefreshCw size={15}/> Refresh</button><button type="button" onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white px-4 py-2 text-sm font-bold"><Plus size={16}/> Create Class</button></div>
    </div>
    {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    {loading ? <div className="py-12 text-center text-sm text-slate-500">Loading classes…</div> : classes.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><CalendarDays className="mx-auto text-indigo-500"/><p className="font-bold mt-3">No classes created yet.</p><p className="text-sm text-slate-500 mt-1">Create the first class from the button above.</p></div> : <div className="grid gap-4 md:grid-cols-2">{classes.map((c) => <article key={c.id} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-indigo-600">{c.courseName}</p><h4 className="font-black text-lg mt-1">{c.subject}</h4><p className="text-sm text-slate-500 mt-1">{c.classGrade}{c.board ? ` • ${c.board}` : ''}</p></div><span className="rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 text-xs font-bold">{c.status}</span></div><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><span className="text-slate-400">Tutor</span><p className="font-semibold">{c.tutorName}</p></div><div><span className="text-slate-400">Students</span><p className="font-semibold inline-flex items-center gap-1"><Users size={14}/>{c.students.length}</p></div><div><span className="text-slate-400">Date</span><p className="font-semibold">{c.date}</p></div><div><span className="text-slate-400">Time</span><p className="font-semibold">{c.startTime}–{c.endTime}</p></div></div>{c.meetingUrl && <a href={c.meetingUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-indigo-600">Open classroom <ExternalLink size={14}/></a>}</article>)}</div>}

    {showCreate && <div className="fixed inset-0 z-50 bg-slate-950/60 p-4 flex items-center justify-center"><div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-6"><div className="flex justify-between items-center"><div><h3 className="text-xl font-black">Create Online Class</h3><p className="text-sm text-slate-500">Assign an approved tutor and students.</p></div><button type="button" onClick={() => setShowCreate(false)}><X/></button></div><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2 mt-6"><label className="text-sm font-bold">Course<select required value={form.courseId} onChange={e => setForm({...form, courseId:e.target.value})} className="mt-1 w-full rounded-xl border p-3"><option value="">Select course</option>{tuitionCourses.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></label><label className="text-sm font-bold">Subject<input required value={form.subject} onChange={e => setForm({...form, subject:e.target.value})} className="mt-1 w-full rounded-xl border p-3"/></label><label className="text-sm font-bold">Class / Grade<input required value={form.classGrade} onChange={e => setForm({...form, classGrade:e.target.value})} placeholder="Class 8" className="mt-1 w-full rounded-xl border p-3"/></label><label className="text-sm font-bold">Board<input value={form.board} onChange={e => setForm({...form, board:e.target.value})} placeholder="CBSE / State Board" className="mt-1 w-full rounded-xl border p-3"/></label><label className="text-sm font-bold">Tutor<select required value={form.tutorId} onChange={e => setForm({...form, tutorId:e.target.value})} className="mt-1 w-full rounded-xl border p-3"><option value="">Select tutor</option>{tutors.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}</select></label><label className="text-sm font-bold">Date<input required type="date" value={form.date} onChange={e => setForm({...form, date:e.target.value})} className="mt-1 w-full rounded-xl border p-3"/></label><label className="text-sm font-bold">Start time<input required type="time" value={form.startTime} onChange={e => setForm({...form, startTime:e.target.value})} className="mt-1 w-full rounded-xl border p-3"/></label><label className="text-sm font-bold">End time<input required type="time" value={form.endTime} onChange={e => setForm({...form, endTime:e.target.value})} className="mt-1 w-full rounded-xl border p-3"/></label><label className="text-sm font-bold">Meeting provider<select value={form.meetingProvider} onChange={e => setForm({...form, meetingProvider:e.target.value})} className="mt-1 w-full rounded-xl border p-3"><option value="google-meet">Google Meet</option><option value="zoom">Zoom</option><option value="jitsi">Jitsi</option><option value="other">Other</option></select></label><label className="text-sm font-bold">Meeting URL<input type="url" value={form.meetingUrl} onChange={e => setForm({...form, meetingUrl:e.target.value})} placeholder="https://..." className="mt-1 w-full rounded-xl border p-3"/></label><label className="text-sm font-bold sm:col-span-2">Students<select multiple value={selectedStudents} onChange={e => setSelectedStudents(Array.from(e.target.selectedOptions, o => o.value))} className="mt-1 w-full rounded-xl border p-3 min-h-32">{students.map(s => <option key={s.id} value={s.id}>{s.student_name}</option>)}</select><span className="text-xs text-slate-500">Use Ctrl/long-press to select multiple students.</span></label><div className="sm:col-span-2 flex justify-end gap-2"><button type="button" onClick={() => setShowCreate(false)} className="rounded-xl border px-4 py-3 font-bold">Cancel</button><button disabled={saving} className="rounded-xl bg-indigo-600 text-white px-5 py-3 font-bold">{saving ? 'Creating…' : 'Create Class'}</button></div></form></div></div>}
  </div>;
}
