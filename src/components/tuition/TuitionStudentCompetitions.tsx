import { useEffect, useState } from 'react';
import { Award, Clock3, Medal, PlayCircle, Trophy } from 'lucide-react';
import {
  getCompetition,
  getLeaderboard,
  getStudentCompetitions,
  registerCompetition,
  startCompetition,
  submitCompetition,
} from '@/lib/tuitionCompetitions';

export default function TuitionStudentCompetitions() {
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [attempt, setAttempt] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const result = await getStudentCompetitions();
      setCompetitions(result.competitions || []);
      setMessage('');
    } catch (error: any) {
      setMessage(error.message || 'Unable to load competitions.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const open = async (id: string) => {
    try {
      const result = await getCompetition(id);
      setSelected(result);
      setAttempt(null);
      setAnswers({});
      const board = await getLeaderboard(id);
      setLeaderboard(board.leaderboard || []);
    } catch (error: any) {
      setMessage(error.message || 'Unable to open competition.');
    }
  };

  const register = async () => {
    try {
      await registerCompetition(selected.competition.id);
      const result = await getCompetition(selected.competition.id);
      setSelected(result);
      setMessage('Competition registration completed.');
    } catch (error: any) {
      setMessage(error.message || 'Unable to register.');
    }
  };

  const start = async () => {
    try {
      const result = await startCompetition(selected.competition.id);
      setAttempt(result.attempt);
      setMessage('Competition started. Submit before the time limit.');
    } catch (error: any) {
      setMessage(error.message || 'Unable to start competition.');
    }
  };

  const submit = async () => {
    try {
      const result = await submitCompetition({
        attemptId: attempt.id,
        answers,
      });
      setAttempt(null);
      setMessage(
        result.result?.timedOut
          ? 'Submission recorded, but the time limit was exceeded.'
          : `Competition completed. Rank will update on the leaderboard.`,
      );
      const board = await getLeaderboard(selected.competition.id);
      setLeaderboard(board.leaderboard || []);
      await load();
    } catch (error: any) {
      setMessage(error.message || 'Unable to submit competition.');
    }
  };

  return (
    <section className="max-w-6xl mx-auto p-5 space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <p className="text-xs font-black uppercase text-indigo-600">VATTAMS Academy</p>
        <h1 className="text-2xl font-black mt-1">Competitions</h1>
        <p className="text-sm text-slate-500 mt-1">
          Challenge yourself, compete fairly and track your result.
        </p>
        {message && <p className="mt-4 rounded-xl bg-indigo-50 p-3 text-sm text-indigo-800">{message}</p>}
      </div>

      {!selected ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {competitions.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => open(item.id)}
              className="bg-white border rounded-3xl p-5 text-left hover:border-indigo-400"
            >
              <Trophy className="text-amber-500" />
              <p className="font-black mt-4">{item.title}</p>
              <p className="text-xs text-indigo-600 font-bold mt-1">{item.category}</p>
              <p className="text-sm text-slate-500 mt-2">{item.description || 'Academy competition'}</p>
              <div className="flex gap-3 text-xs text-slate-500 mt-4">
                <span className="flex items-center gap-1"><Clock3 size={13} /> {item.duration_minutes} min</span>
                <span>{item.competition_type}</span>
              </div>
            </button>
          ))}
          {!competitions.length && <p className="text-sm text-slate-400">No competitions published yet.</p>}
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1.25fr_.75fr] gap-5">
          <div className="bg-white border rounded-3xl p-5">
            <button type="button" onClick={() => setSelected(null)} className="text-xs font-black text-indigo-600">
              ← Back to competitions
            </button>

            <div className="flex items-start gap-3 mt-4">
              <Trophy className="text-amber-500 shrink-0" />
              <div>
                <h2 className="text-xl font-black">{selected.competition.title}</h2>
                <p className="text-xs text-indigo-600 font-bold">{selected.competition.category}</p>
              </div>
            </div>

            <p className="text-sm text-slate-500 mt-3">{selected.competition.description}</p>

            {!attempt ? (
              selected.entry?.status === 'submitted' ? (
                <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm">
                  <p className="font-black">Already submitted</p>
                  <p className="mt-1">Your result is recorded in the leaderboard.</p>
                </div>
              ) : !selected.entry ? (
                <button type="button" onClick={register} className="mt-5 rounded-xl bg-indigo-600 text-white px-5 py-3 font-black">
                  Register for Competition
                </button>
              ) : (
                <button type="button" onClick={start} className="mt-5 rounded-xl bg-indigo-600 text-white px-5 py-3 font-black inline-flex items-center gap-2">
                  <PlayCircle size={17} /> Start Competition
                </button>
              )
            ) : (
              <div className="space-y-5 mt-5">
                {(selected.questions || []).map((q: any, index: number) => (
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

                <button type="button" onClick={submit} className="w-full rounded-xl bg-emerald-600 text-white px-5 py-3 font-black">
                  Submit Competition
                </button>
              </div>
            )}
          </div>

          <div className="bg-white border rounded-3xl p-5">
            <div className="flex items-center gap-2">
              <Medal className="text-amber-500" />
              <h2 className="font-black">Leaderboard</h2>
            </div>
            <div className="space-y-2 mt-4">
              {leaderboard.map((row, index) => (
                <div key={`${row.student_id}-${index}`} className="rounded-xl border p-3 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black">
                    {row.rank || index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-black">Participant</p>
                    <p className="text-xs text-slate-500">{row.percentage}%</p>
                  </div>
                  {row.award && <span className="text-[10px] font-black uppercase text-amber-600">{row.award}</span>}
                </div>
              ))}
              {!leaderboard.length && <p className="text-sm text-slate-400 py-6 text-center">Leaderboard will appear after submissions.</p>}
            </div>

            <div className="mt-5 rounded-2xl bg-indigo-50 p-4 text-sm flex gap-2">
              <Award size={18} className="text-indigo-600 shrink-0" />
              Awards are performance indicators created by VATTAMS Academy and are not external accreditation.
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
