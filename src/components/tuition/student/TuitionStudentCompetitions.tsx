import { useEffect, useState } from 'react';
import { Clock3, Medal, Trophy } from 'lucide-react';
import {
  getLeaderboard,
  listCompetitions,
  registerCompetition,
  startCompetition,
  submitCompetition,
} from '@/lib/tuitionCompetitions';

export default function TuitionStudentCompetitions() {
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [remaining, setRemaining] = useState(0);
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const result = await listCompetitions();
      setCompetitions(result.competitions || []);
    } catch (e: any) {
      setMessage(e.message || 'Unable to load competitions.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          setMessage('Contest time is over. Submit your answers.');
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [active]);

  const register = async (id: string) => {
    try {
      await registerCompetition(id);
      setMessage('Competition registration completed.');
    } catch (e: any) {
      setMessage(e.message || 'Unable to register.');
    }
  };

  const start = async (id: string) => {
    try {
      const result = await startCompetition(id);
      setActive(result);
      setAnswers({});
      setRemaining(Number(result.competition.duration_minutes || 30) * 60);
    } catch (e: any) {
      setMessage(e.message || 'Unable to start competition.');
    }
  };

  const finish = async () => {
    if (!active) return;
    try {
      const result = await submitCompetition({
        attemptId: active.attempt.id,
        answers: Object.entries(answers).map(([questionId, answerText]) => ({
          questionId,
          answerText,
        })),
      });

      setMessage(
        `Contest submitted. Score: ${result.result.score}/${result.result.maxScore} (${result.result.percentage}%).`
      );

      const lb = await getLeaderboard(active.competition.id);
      setLeaderboard(lb.leaderboard || []);
      setActive(null);
      await load();
    } catch (e: any) {
      setMessage(e.message || 'Unable to submit competition.');
    }
  };

  const format = (seconds: number) =>
    `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60)
      .toString()
      .padStart(2, '0')}`;

  if (active) {
    return (
      <section className="bg-white border rounded-3xl p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-amber-600">Competition</p>
            <h2 className="text-xl font-black">{active.competition.title}</h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 font-black text-amber-800">
            <Clock3 size={17} />
            {format(remaining)}
          </div>
        </div>

        <div className="space-y-5 mt-6">
          {(active.questions || []).map((q: any, index: number) => (
            <div key={q.id} className="rounded-2xl border p-4">
              <p className="font-bold">{index + 1}. {q.question_text}</p>

              {q.question_type === 'mcq' && Array.isArray(q.options) && (
                <div className="space-y-2 mt-3">
                  {q.options.map((option: string) => (
                    <label key={option} className="flex items-center gap-3 rounded-xl border p-3 cursor-pointer">
                      <input
                        type="radio"
                        name={q.id}
                        value={option}
                        checked={answers[q.id] === option}
                        onChange={() => setAnswers({ ...answers, [q.id]: option })}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.question_type === 'true_false' && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {['true', 'false'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setAnswers({ ...answers, [q.id]: option })}
                      className={`rounded-xl border p-3 font-bold ${
                        answers[q.id] === option ? 'bg-amber-500 text-white' : ''
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {q.question_type === 'short_answer' && (
                <textarea
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
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
          className="mt-6 rounded-xl bg-amber-500 px-5 py-3 text-white font-black"
        >
          Submit Competition
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      {message && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-900">
          {message}
        </p>
      )}

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center gap-3">
          <Trophy className="text-amber-500" />
          <div>
            <p className="text-xs font-black uppercase text-amber-600">VATTAMS Academy</p>
            <h2 className="text-xl font-black">Competitions</h2>
          </div>
        </div>

        <div className="space-y-3 mt-5">
          {competitions.map((c) => (
            <div key={c.id} className="rounded-2xl border p-4">
              <div className="flex gap-3">
                <Medal className="text-amber-500 shrink-0" />
                <div className="flex-1">
                  <p className="font-black">{c.title}</p>
                  <p className="text-xs text-slate-500">{c.category} · {c.level}</p>
                  <p className="text-sm text-slate-600 mt-2">{c.description || 'Online academic competition.'}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {new Date(c.starts_at).toLocaleString()} · {c.duration_minutes} min
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {c.status === 'registration_open' && (
                  <button
                    type="button"
                    onClick={() => register(c.id)}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-white text-sm font-black"
                  >
                    Register
                  </button>
                )}
                {c.status === 'live' && (
                  <button
                    type="button"
                    onClick={() => start(c.id)}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-white text-sm font-black"
                  >
                    Enter Competition
                  </button>
                )}
              </div>
            </div>
          ))}

          {!competitions.length && (
            <p className="text-sm text-slate-400 text-center py-8">
              No competitions are open right now.
            </p>
          )}
        </div>
      </div>

      {leaderboard.length > 0 && (
        <div className="bg-white border rounded-3xl p-5">
          <h2 className="text-xl font-black">Latest Leaderboard</h2>
          <div className="space-y-2 mt-4">
            {leaderboard.slice(0, 10).map((row) => (
              <div key={row.student_id} className="flex justify-between rounded-xl border p-3">
                <span className="font-black">#{row.rank}</span>
                <span>{row.score} points</span>
                <span className="font-bold">{row.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
