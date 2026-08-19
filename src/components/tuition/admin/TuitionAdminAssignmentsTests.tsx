import { useEffect, useState } from 'react';
import { ClipboardList, FileCheck2, Plus } from 'lucide-react';
import {
  createAssignment,
  createTest,
  addTestQuestion,
  getTutorAssignments,
  getTutorTests,
} from '@/lib/tuitionAssignmentsTests';

export default function TuitionAdminAssignmentsTests() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [mode, setMode] = useState<'assignment' | 'test'>('assignment');
  const [form, setForm] = useState<any>({
    title: '',
    description: '',
    instructions: '',
    dueAt: '',
    maxScore: 100,
    durationMinutes: 30,
    maxAttempts: 1,
    passPercentage: 40,
    courseId: '',
  });
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const [a, t] = await Promise.all([
        getTutorAssignments(),
        getTutorTests(),
      ]);
      setAssignments(a.assignments || []);
      setTests(t.tests || []);
    } catch (error: any) {
      setMessage(error.message || 'Unable to load assessment management.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    try {
      if (mode === 'assignment') {
        await createAssignment({
          title: form.title,
          description: form.description,
          instructions: form.instructions,
          dueAt: form.dueAt || null,
          maxScore: Number(form.maxScore || 100),
          courseId: form.courseId || null,
          isPublished: true,
        });
      } else {
        await createTest({
          title: form.title,
          description: form.description,
          durationMinutes: Number(form.durationMinutes || 30),
          maxAttempts: Number(form.maxAttempts || 1),
          passPercentage: Number(form.passPercentage || 40),
          courseId: form.courseId || null,
          isPublished: true,
        });
      }

      setForm({
        title: '',
        description: '',
        instructions: '',
        dueAt: '',
        maxScore: 100,
        durationMinutes: 30,
        maxAttempts: 1,
        passPercentage: 40,
        courseId: '',
      });
      setMessage(`${mode === 'assignment' ? 'Assignment' : 'Test'} published.`);
      await load();
    } catch (error: any) {
      setMessage(error.message || 'Unable to create learning activity.');
    }
  };

  return (
    <section className="space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <p className="text-xs font-black uppercase text-indigo-600">Academy Management</p>
        <h2 className="text-xl font-black mt-1">Assignments & Tests</h2>

        <div className="flex gap-2 mt-5">
          <button type="button" onClick={() => setMode('assignment')} className={`rounded-xl px-4 py-2 font-black ${mode === 'assignment' ? 'bg-indigo-600 text-white' : 'border'}`}>
            <ClipboardList size={15} className="inline mr-1" /> Assignment
          </button>
          <button type="button" onClick={() => setMode('test')} className={`rounded-xl px-4 py-2 font-black ${mode === 'test' ? 'bg-indigo-600 text-white' : 'border'}`}>
            <FileCheck2 size={15} className="inline mr-1" /> Test
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-3 mt-5">
          <input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="Title" className="rounded-xl border p-3" />
          <input value={form.courseId} onChange={(e) => setForm({...form, courseId: e.target.value})} placeholder="Course ID (optional)" className="rounded-xl border p-3" />
          <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="Description" className="rounded-xl border p-3" />
          {mode === 'assignment' ? (
            <>
              <textarea value={form.instructions} onChange={(e) => setForm({...form, instructions: e.target.value})} placeholder="Instructions" className="rounded-xl border p-3" />
              <input type="datetime-local" value={form.dueAt} onChange={(e) => setForm({...form, dueAt: e.target.value ? new Date(e.target.value).toISOString() : ''})} className="rounded-xl border p-3" />
              <input type="number" value={form.maxScore} onChange={(e) => setForm({...form, maxScore: e.target.value})} placeholder="Max score" className="rounded-xl border p-3" />
            </>
          ) : (
            <>
              <input type="number" value={form.durationMinutes} onChange={(e) => setForm({...form, durationMinutes: e.target.value})} placeholder="Duration (minutes)" className="rounded-xl border p-3" />
              <input type="number" value={form.maxAttempts} onChange={(e) => setForm({...form, maxAttempts: e.target.value})} placeholder="Max attempts" className="rounded-xl border p-3" />
              <input type="number" value={form.passPercentage} onChange={(e) => setForm({...form, passPercentage: e.target.value})} placeholder="Pass percentage" className="rounded-xl border p-3" />
            </>
          )}
        </div>

        <button type="button" onClick={create} className="mt-4 rounded-xl bg-indigo-600 text-white px-5 py-3 font-black inline-flex gap-2 items-center">
          <Plus size={16} /> Publish {mode === 'assignment' ? 'Assignment' : 'Test'}
        </button>

        {message && <p className="mt-4 rounded-xl bg-indigo-50 p-3 text-sm text-indigo-800">{message}</p>}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <List title="Assignments" items={assignments} />
        <List title="Tests" items={tests} />
      </div>
    </section>
  );
}

function List({ title, items }: { title: string; items: any[] }) {
  return (
    <div className="bg-white border rounded-3xl p-5">
      <h3 className="font-black">{title}</h3>
      <div className="space-y-2 mt-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border p-3">
            <p className="font-black">{item.title}</p>
            <p className="text-xs text-slate-500 mt-1">{item.status}</p>
          </div>
        ))}
        {!items.length && <p className="text-sm text-slate-400 py-5">Nothing created yet.</p>}
      </div>
    </div>
  );
}
