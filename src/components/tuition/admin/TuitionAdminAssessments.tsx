import { useEffect, useState } from 'react';
import { ClipboardList, Plus, RefreshCw, TestTube2 } from 'lucide-react';
import {
  createAssignment,
  createQuestionBank,
  addQuestion,
  createTest,
  listAssignments,
  listQuestionBanks,
  listTests,
  publishAssignment,
  publishTest,
} from '@/lib/tuitionAssessments';

export default function TuitionAdminAssessments() {
  const [tab, setTab] = useState<'assignments' | 'tests'>('assignments');
  const [items, setItems] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');

  const load = async () => {
    setBusy(true);
    try {
      const result =
        tab === 'assignments'
          ? await listAssignments(courseId || undefined)
          : await listTests(courseId || undefined);
      setItems(result.items || []);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, [tab]);

  const addAssignment = async () => {
    if (!title.trim()) return;
    await createAssignment({
      title,
      courseId: courseId || null,
      maxMarks: 100,
    });
    setTitle('');
    await load();
  };

  const addTest = async () => {
    if (!title.trim()) return;
    await createTest({
      title,
      courseId: courseId || null,
      durationMinutes: 30,
      passPercentage: 40,
      maxAttempts: 1,
    });
    setTitle('');
    await load();
  };

  const createStarterQuestionBank = async () => {
    if (!title.trim()) return;
    const bank = await createQuestionBank({
      title: `${title} Question Bank`,
      courseId: courseId || null,
    });
    await addQuestion({
      questionBankId: bank.bank.id,
      questionText: 'Sample question — replace this with your own question.',
      questionType: 'mcq',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A',
      marks: 1,
    });
    alert('Question bank created. Add more questions before publishing the test.');
  };

  return (
    <section className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-indigo-600">
            Assessments
          </p>
          <h2 className="text-xl font-black mt-1">Assignments & Tests</h2>
          <p className="text-sm text-slate-500 mt-1">
            Create learning work and auto-scored tests for students.
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-sm"
        >
          <RefreshCw size={16} className={busy ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="flex gap-2 mt-5">
        <button
          type="button"
          onClick={() => setTab('assignments')}
          className={`px-4 py-2 rounded-xl text-sm font-bold ${
            tab === 'assignments'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          <ClipboardList size={15} className="inline mr-1" />
          Assignments
        </button>

        <button
          type="button"
          onClick={() => setTab('tests')}
          className={`px-4 py-2 rounded-xl text-sm font-bold ${
            tab === 'tests'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          <TestTube2 size={15} className="inline mr-1" />
          Tests
        </button>
      </div>

      <div className="grid md:grid-cols-[1fr_180px_auto_auto] gap-2 mt-5">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={
            tab === 'assignments'
              ? 'Assignment title'
              : 'Test title'
          }
          className="px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
        />

        <input
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          placeholder="Course ID"
          className="px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
        />

        <button
          type="button"
          onClick={tab === 'assignments' ? addAssignment : addTest}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 text-white font-bold"
        >
          <Plus size={17} />
          Create
        </button>

        {tab === 'tests' && (
          <button
            type="button"
            onClick={createStarterQuestionBank}
            className="px-4 py-3 rounded-xl bg-slate-900 text-white font-bold"
          >
            Question Bank
          </button>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col md:flex-row md:items-center justify-between gap-3 border border-slate-200 rounded-2xl p-4"
          >
            <div>
              <h3 className="font-extrabold">{item.title}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {item.is_published ? 'Published' : 'Draft'} ·{' '}
                {tab === 'assignments'
                  ? `${item.max_marks} marks`
                  : `${item.duration_minutes} minutes`}
              </p>
            </div>

            <button
              type="button"
              onClick={async () => {
                if (tab === 'assignments') {
                  await publishAssignment(item.id, !item.is_published);
                } else {
                  await publishTest(item.id, !item.is_published);
                }
                await load();
              }}
              className={`px-4 py-2 rounded-xl text-sm font-bold ${
                item.is_published
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {item.is_published ? 'Unpublish' : 'Publish'}
            </button>
          </div>
        ))}

        {!items.length && (
          <div className="text-center py-10 text-slate-400 text-sm">
            No {tab} created yet.
          </div>
        )}
      </div>
    </section>
  );
}