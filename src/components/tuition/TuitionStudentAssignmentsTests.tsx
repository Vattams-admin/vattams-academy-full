import { useEffect, useState } from 'react';
import { CheckCircle2, ClipboardList, Clock, FileCheck2, PlayCircle } from 'lucide-react';
import {
  getStudentAssignments,
  getStudentTests,
  getTest,
  startTest,
  submitAssignment,
  submitTest,
} from '@/lib/tuitionAssignmentsTests';

export default function TuitionStudentAssignmentsTests() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [attempt, setAttempt] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [assignmentText, setAssignmentText] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const [a, t] = await Promise.all([
        getStudentAssignments(),
        getStudentTests(),
      ]);
      setAssignments(a.assignments || []);
      setSubmissions(a.submissions || []);
      setTests(t.tests || []);
      setMessage('');
    } catch (error: any) {
      setMessage(error.message || 'Unable to load assignments and tests.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (assignmentId: string) => {
    try {
      await submitAssignment({
        assignmentId,
        submissionText: assignmentText[assignmentId] || '',
      });
      setMessage('Assignment submitted successfully.');
      await load();
    } catch (error: any) {
      setMessage(error.message || 'Unable to submit assignment.');
    }
  };

  const openTest = async (testId: string) => {
    try {
      setSelectedTest(await getTest(testId));
      setAttempt(null);
      setAnswers({});
      setMessage('');
    } catch (error: any) {
      setMessage(error.message || 'Unable to open test.');
    }
  };

  const begin = async () => {
    try {
      const result = await startTest(selectedTest.test.id);
      setAttempt(result.attempt);
      setMessage('Test started. Complete all questions and submit once.');
    } catch (error: any) {
      setMessage(error.message || 'Unable to start test.');
    }
  };

  const finish = async () => {
    if (!attempt) return;

    try {
      const result = await submitTest({
        attemptId: attempt.id,
        answers,
      });
      setMessage(result.passed ? 'Test submitted — Passed.' : 'Test submitted — Result recorded.');
      setAttempt(null);
      await load();
    } catch (error: any) {
      setMessage(error.message || 'Unable to submit test.');
    }
  };

  return (
    <section className="max-w-6xl mx-auto p-5 space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <p className="text-xs font-black uppercase text-indigo-600">VATTAMS Academy</p>
        <h1 className="text-2xl font-black mt-1">Assignments & Tests</h1>
        <p className="text-sm text-slate-500 mt-1">
          Complete your learning activities and online assessments.
        </p>
        {message && <p className="mt-4 rounded-xl bg-indigo-50 p-3 text-sm text-indigo-800">{message}</p>}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white border rounded-3xl p-5">
          <div className="flex items-center gap-2">
            <ClipboardList className="text-indigo-600" />
            <h2 className="font-black">Assignments</h2>
          </div>

          <div className="space-y-4 mt-4">
            {assignments.map((item) => {
              const submission = submissions.find((s) => s.assignment_id === item.id);
              return (
                <div key={item.id} className="rounded-2xl border p-4">
                  <p className="font-black">{item.title}</p>
                  <p className="text-sm text-slate-500 mt-1">{item.description || item.instructions || 'Complete the assigned work.'}</p>
                  {item.due_at && (
                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                      <Clock size={13} /> Due {new Date(item.due_at).toLocaleString()}
                    </p>
                  )}

                  {submission?.status === 'reviewed' ? (
                    <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm">
                      <p className="font-black">Reviewed: {submission.score ?? 0}/{item.max_score}</p>
                      <p className="mt-1">{submission.feedback || 'No feedback added.'}</p>
                    </div>
                  ) : (
                    <>
                      <textarea
                        value={assignmentText[item.id] || submission?.submission_text || ''}
                        onChange={(e) => setAssignmentText({...assignmentText, [item.id]: e.target.value})}
                        placeholder="Write your submission..."
                        className="w-full mt-3 rounded-xl border p-3 min-h-24"
                      />
                      <button
                        type="button"
                        onClick={() => submit(item.id)}
                        className="mt-2 rounded-xl bg-indigo-600 text-white px-4 py-2 font-black"
                      >
                        {submission ? 'Update Submission' : 'Submit Assignment'}
                      </button>
                    </>
                  )}
                </div>
              );
            })}
            {!assignments.length && <p className="text-sm text-slate-400 py-8 text-center">No assignments published yet.</p>}
          </div>
        </div>

        <div className="bg-white border rounded-3xl p-5">
          <div className="flex items-center gap-2">
            <FileCheck2 className="text-indigo-600" />
            <h2 className="font-black">Tests</h2>
          </div>

          {!selectedTest ? (
            <div className="space-y-3 mt-4">
              {tests.map((test) => (
                <button
                  type="button"
                  key={test.id}
                  onClick={() => openTest(test.id)}
                  className="w-full text-left rounded-2xl border p-4"
                >
                  <p className="font-black">{test.title}</p>
                  <p className="text-sm text-slate-500 mt-1">{test.description || 'Online assessment'}</p>
                  <div className="flex gap-3 text-xs mt-2">
                    <span>{test.duration_minutes} min</span>
                    <span>Pass {test.pass_percentage}%</span>
                    <span>{test.max_attempts} attempt(s)</span>
                  </div>
                </button>
              ))}
              {!tests.length && <p className="text-sm text-slate-400 py-8 text-center">No tests available.</p>}
            </div>
          ) : (
            <div className="mt-4">
              <button type="button" onClick={() => setSelectedTest(null)} className="text-xs font-black text-indigo-600">
                ← Back to tests
              </button>
              <h3 className="text-xl font-black mt-3">{selectedTest.test.title}</h3>

              {!attempt ? (
                <button type="button" onClick={begin} className="mt-5 rounded-xl bg-indigo-600 text-white px-5 py-3 font-black inline-flex items-center gap-2">
                  <PlayCircle size={17} /> Start Test
                </button>
              ) : (
                <div className="space-y-5 mt-5">
                  {(selectedTest.questions || []).map((q: any, index: number) => (
                    <div key={q.id} className="rounded-2xl border p-4">
                      <p className="font-black">{index + 1}. {q.question_text}</p>
                      {q.question_type === 'mcq' && Array.isArray(q.options) ? (
                        <div className="space-y-2 mt-3">
                          {q.options.map((option: any, i: number) => {
                            const value = typeof option === 'string' ? option : option.value ?? option.label ?? String(i + 1);
                            return (
                              <label key={i} className="flex gap-2 items-center rounded-xl border p-3">
                                <input
                                  type="radio"
                                  name={q.id}
                                  value={value}
                                  checked={answers[q.id] === value}
                                  onChange={() => setAnswers({...answers, [q.id]: value})}
                                />
                                <span>{value}</span>
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        <input
                          value={answers[q.id] || ''}
                          onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                          placeholder="Your answer"
                          className="w-full mt-3 rounded-xl border p-3"
                        />
                      )}
                    </div>
                  ))}

                  <button type="button" onClick={finish} className="w-full rounded-xl bg-emerald-600 text-white px-5 py-3 font-black">
                    Submit Test
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-900 flex gap-2">
        <CheckCircle2 size={18} className="shrink-0" />
        Results are recorded in the Academy assessment system and can contribute to learning progress.
      </div>
    </section>
  );
}
