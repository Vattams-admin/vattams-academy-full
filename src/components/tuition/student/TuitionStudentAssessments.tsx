import { useEffect, useState } from 'react';
import {
  ClipboardCheck,
  Clock3,
  FileText,
  Send,
  Trophy,
} from 'lucide-react';
import {
  listAssignments,
  listTests,
  startTest,
  submitAssignment,
  submitTest,
} from '@/lib/tuitionAssessments';

export default function TuitionStudentAssessments({
  courseId,
}: {
  courseId?: string;
}) {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [submission, setSubmission] = useState<Record<string, string>>({});
  const [activeTest, setActiveTest] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [remaining, setRemaining] = useState(0);

  const load = async () => {
    try {
      const [a, t] = await Promise.all([
        listAssignments(courseId),
        listTests(courseId),
      ]);
      setAssignments(a.assignments || []);
      setTests(t.tests || []);
    } catch (e: any) {
      setMessage(e.message || 'Unable to load assessments.');
    }
  };

  useEffect(() => {
    load();
  }, [courseId]);

  useEffect(() => {
    if (!activeTest) return;

    const timer = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          setMessage('Time is over. Please submit your test.');
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [activeTest]);

  const submitWork = async (assignmentId: string) => {
    try {
      await submitAssignment({
        assignmentId,
        submissionText: submission[assignmentId] || '',
      });
      setMessage('Assignment submitted successfully.');
    } catch (e: any) {
      setMessage(e.message || 'Unable to submit assignment.');
    }
  };

  const begin = async (testId: string) => {
    try {
      const result = await startTest(testId);
      setActiveTest(result);
      setAnswers({});
      setRemaining(Number(result.test.durationMinutes || 30) * 60);
    } catch (e: any) {
      setMessage(e.message || 'Unable to start test.');
    }
  };

  const finish = async () => {
    if (!activeTest) return;

    try {
      const result = await submitTest({
        attemptId: activeTest.attempt.id,
        answers: Object.entries(answers).map(([questionId, answerText]) => ({
          questionId,
          answerText,
        })),
      });

      setMessage(
        `Test submitted. Score: ${result.result.score}/${result.result.maxScore} (${result.result.percentage}%). ${
          result.result.passed ? 'Passed.' : 'Not passed.'
        }`,
      );
      setActiveTest(null);
      await load();
    } catch (e: any) {
      setMessage(e.message || 'Unable to submit test.');
    }
  };

  const format = (seconds: number) =>
    `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60)
      .toString()
      .padStart(2, '0')}`;

  if (activeTest) {
    return (
      <section className="bg-white border rounded-3xl p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-indigo-600">
              Online Test
            </p>
            <h2 className="text-xl font-black">{activeTest.test.title}</h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 font-black text-amber-800">
            <Clock3 size={17} />
            {format(remaining)}
          </div>
        </div>

        <div className="space-y-5 mt-6">
          {(activeTest.questions || []).map((question: any, index: number) => (
            <div key={question.id} className="rounded-2xl border p-4">
              <p className="font-bold">
                {index + 1}. {question.question_text}
              </p>

              {question.question_type === 'mcq' &&
                Array.isArray(question.options) && (
                  <div className="space-y-2 mt-3">
                    {question.options.map((option: string) => (
                      <label
                        key={option}
                        className="flex items-center gap-3 rounded-xl border p-3 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={() =>
                            setAnswers({ ...answers, [question.id]: option })
                          }
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                )}

              {question.question_type === 'true_false' && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {['true', 'false'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        setAnswers({ ...answers, [question.id]: option })
                      }
                      className={`rounded-xl border p-3 font-bold ${
                        answers[question.id] === option
                          ? 'bg-indigo-600 text-white'
                          : ''
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {question.question_type === 'short_answer' && (
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) =>
                    setAnswers({ ...answers, [question.id]: e.target.value })
                  }
                  className="w-full mt-3 rounded-xl border p-3 min-h-24"
                  placeholder="Type your answer..."
                />
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={finish}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-white font-black"
        >
          <Trophy size={17} />
          Submit Test
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      {message && (
        <p className="rounded-xl bg-indigo-50 p-3 text-sm font-semibold text-indigo-800">
          {message}
        </p>
      )}

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center gap-3">
          <FileText className="text-indigo-600" />
          <h2 className="text-xl font-black">Assignments</h2>
        </div>

        <div className="space-y-4 mt-5">
          {assignments.map((item) => (
            <div key={item.id} className="rounded-2xl border p-4">
              <p className="font-black">{item.title}</p>
              <p className="text-sm text-slate-600 mt-1">
                {item.description || 'Complete this assignment.'}
              </p>
              {item.due_at && (
                <p className="text-xs text-slate-500 mt-2">
                  Due: {new Date(item.due_at).toLocaleString()}
                </p>
              )}

              <textarea
                value={submission[item.id] || ''}
                onChange={(e) =>
                  setSubmission({
                    ...submission,
                    [item.id]: e.target.value,
                  })
                }
                className="w-full mt-3 rounded-xl border p-3 min-h-24"
                placeholder="Write your submission..."
              />

              <button
                type="button"
                onClick={() => submitWork(item.id)}
                className="mt-2 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-white text-sm font-black"
              >
                <Send size={15} />
                Submit Assignment
              </button>
            </div>
          ))}

          {!assignments.length && (
            <p className="text-sm text-slate-400">No assignments available.</p>
          )}
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="text-indigo-600" />
          <h2 className="text-xl font-black">Online Tests</h2>
        </div>

        <div className="space-y-3 mt-5">
          {tests.map((test) => (
            <div key={test.id} className="rounded-2xl border p-4">
              <p className="font-black">{test.title}</p>
              <p className="text-xs text-slate-500 mt-1">
                {test.duration_minutes} minutes · Pass {test.pass_percentage}%
              </p>
              <button
                type="button"
                onClick={() => begin(test.id)}
                className="mt-3 rounded-xl bg-emerald-600 px-4 py-2 text-white text-sm font-black"
              >
                Start Test
              </button>
            </div>
          ))}

          {!tests.length && (
            <p className="text-sm text-slate-400">No tests available.</p>
          )}
        </div>
      </div>
    </section>
  );
}
