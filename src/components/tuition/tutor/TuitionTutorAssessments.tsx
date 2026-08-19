import { useEffect, useState } from 'react';
import {
  ClipboardList,
  FilePlus2,
  RefreshCw,
  Save,
} from 'lucide-react';
import {
  createAssignment,
  createTest,
  addTestQuestion,
  listAssignments,
  listTests,
} from '@/lib/tuitionAssessments';

export default function TuitionTutorAssessments({
  courseId,
}: {
  courseId?: string;
}) {
  const [message, setMessage] = useState('');
  const [assignments, setAssignments] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [assignment, setAssignment] = useState({
    title: '',
    description: '',
    dueAt: '',
    maxScore: '100',
  });
  const [test, setTest] = useState({
    title: '',
    description: '',
    durationMinutes: '30',
    passPercentage: '40',
  });

  const load = async () => {
    try {
      const [a, t] = await Promise.all([
        listAssignments(courseId),
        listTests(courseId),
      ]);
      setAssignments(a.assignments || []);
      setTests(t.tests || []);
    } catch (e: any) {
      setMessage(e.message || 'Unable to load assessment data.');
    }
  };

  useEffect(() => {
    load();
  }, [courseId]);

  const saveAssignment = async () => {
    if (!courseId || !assignment.title) {
      setMessage('Course ID and assignment title are required.');
      return;
    }
    try {
      await createAssignment({
        courseId,
        title: assignment.title,
        description: assignment.description,
        dueAt: assignment.dueAt
          ? new Date(assignment.dueAt).toISOString()
          : null,
        maxScore: Number(assignment.maxScore),
        status: 'published',
      });
      setMessage('Assignment published.');
      setAssignment({
        title: '',
        description: '',
        dueAt: '',
        maxScore: '100',
      });
      await load();
    } catch (e: any) {
      setMessage(e.message || 'Unable to create assignment.');
    }
  };

  const saveTest = async () => {
    if (!courseId || !test.title) {
      setMessage('Course ID and test title are required.');
      return;
    }
    try {
      await createTest({
        courseId,
        title: test.title,
        description: test.description,
        durationMinutes: Number(test.durationMinutes),
        passPercentage: Number(test.passPercentage),
        status: 'published',
      });
      setMessage('Test published.');
      setTest({
        title: '',
        description: '',
        durationMinutes: '30',
        passPercentage: '40',
      });
      await load();
    } catch (e: any) {
      setMessage(e.message || 'Unable to create test.');
    }
  };

  return (
    <section className="space-y-5">
      {message && (
        <p className="rounded-xl bg-indigo-50 p-3 text-sm font-semibold text-indigo-800">
          {message}
        </p>
      )}

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FilePlus2 className="text-indigo-600" />
            <h2 className="text-xl font-black">Create Assignment</h2>
          </div>
          <button type="button" onClick={load} className="p-2 rounded-xl border">
            <RefreshCw size={17} />
          </button>
        </div>

        <div className="grid gap-3 mt-5">
          <input
            value={assignment.title}
            onChange={(e) =>
              setAssignment({ ...assignment, title: e.target.value })
            }
            placeholder="Assignment title"
            className="rounded-xl border p-3"
          />
          <textarea
            value={assignment.description}
            onChange={(e) =>
              setAssignment({ ...assignment, description: e.target.value })
            }
            placeholder="Description / instructions"
            className="rounded-xl border p-3 min-h-24"
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              type="datetime-local"
              value={assignment.dueAt}
              onChange={(e) =>
                setAssignment({ ...assignment, dueAt: e.target.value })
              }
              className="rounded-xl border p-3"
            />
            <input
              type="number"
              min="0"
              value={assignment.maxScore}
              onChange={(e) =>
                setAssignment({ ...assignment, maxScore: e.target.value })
              }
              placeholder="Max score"
              className="rounded-xl border p-3"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={saveAssignment}
          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-white font-black"
        >
          <Save size={16} />
          Publish Assignment
        </button>
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center gap-3">
          <ClipboardList className="text-emerald-600" />
          <h2 className="text-xl font-black">Create Online Test</h2>
        </div>

        <div className="grid gap-3 mt-5">
          <input
            value={test.title}
            onChange={(e) => setTest({ ...test, title: e.target.value })}
            placeholder="Test title"
            className="rounded-xl border p-3"
          />
          <textarea
            value={test.description}
            onChange={(e) =>
              setTest({ ...test, description: e.target.value })
            }
            placeholder="Test description"
            className="rounded-xl border p-3"
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              type="number"
              min="1"
              value={test.durationMinutes}
              onChange={(e) =>
                setTest({ ...test, durationMinutes: e.target.value })
              }
              placeholder="Duration minutes"
              className="rounded-xl border p-3"
            />
            <input
              type="number"
              min="0"
              max="100"
              value={test.passPercentage}
              onChange={(e) =>
                setTest({ ...test, passPercentage: e.target.value })
              }
              placeholder="Pass percentage"
              className="rounded-xl border p-3"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={saveTest}
          className="mt-3 rounded-xl bg-emerald-600 px-5 py-3 text-white font-black"
        >
          Publish Test
        </button>
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <h2 className="text-xl font-black">Published Assessments</h2>
        <div className="grid md:grid-cols-2 gap-3 mt-4">
          {assignments.map((a) => (
            <div key={a.id} className="rounded-2xl border p-4">
              <p className="font-black">{a.title}</p>
              <p className="text-xs text-slate-500">Assignment</p>
            </div>
          ))}
          {tests.map((t) => (
            <div key={t.id} className="rounded-2xl border p-4">
              <p className="font-black">{t.title}</p>
              <p className="text-xs text-slate-500">
                Test · {t.duration_minutes} min
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
