import { useMemo, useState } from 'react';
import {
  Award,
  CheckCircle2,
  Clock3,
  Medal,
  ShieldCheck,
  Trophy,
} from 'lucide-react';
import {
  calculatePercentage,
  canRegisterForCompetition,
  getLeaderboard,
  type AcademyCompetition,
  type CompetitionResult,
} from '@/lib/academyCompetitions';

const DEMO_COMPETITION: AcademyCompetition = {
  id: 'competition-1',
  title: 'VATTAMS Academy Knowledge Challenge',
  description:
    'An online academic challenge covering reasoning, mathematics and general knowledge.',
  category: 'Academic',
  startAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  endAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
  maxParticipants: 200,
  status: 'upcoming',
  active: true,
};

const DEMO_RESULTS: CompetitionResult[] = [
  {
    competitionId: 'competition-1',
    studentId: 'student-1',
    studentName: 'Student One',
    score: 94,
    maxScore: 100,
    rank: 1,
    submittedAt: '2026-08-17T09:00:00.000Z',
  },
  {
    competitionId: 'competition-1',
    studentId: 'student-2',
    studentName: 'Student Two',
    score: 91,
    maxScore: 100,
    rank: 2,
    submittedAt: '2026-08-17T09:10:00.000Z',
  },
  {
    competitionId: 'competition-1',
    studentId: 'student-3',
    studentName: 'Student Three',
    score: 87,
    maxScore: 100,
    rank: 3,
    submittedAt: '2026-08-17T09:20:00.000Z',
  },
  {
    competitionId: 'competition-1',
    studentId: 'student-demo',
    studentName: 'You',
    score: 84,
    maxScore: 100,
    rank: 4,
    submittedAt: '2026-08-17T09:30:00.000Z',
  },
];

export default function AcademyCompetitionsLeaderboard({
  competition = DEMO_COMPETITION,
  results = DEMO_RESULTS,
}: {
  competition?: AcademyCompetition;
  results?: CompetitionResult[];
}) {
  const [registered, setRegistered] = useState(false);
  const [message, setMessage] = useState('');

  const leaderboard = useMemo(
    () => getLeaderboard(results),
    [results],
  );

  const register = () => {
    if (!canRegisterForCompetition(competition)) {
      setMessage('Registration is not currently available.');
      return;
    }

    setRegistered(true);
    setMessage('Competition registration request created.');
  };

  const myResult = leaderboard.find((item) => item.studentId === 'student-demo');

  return (
    <section className="space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-amber-50 text-amber-600 p-3">
              <Trophy size={22} />
            </div>
            <div>
              <p className="text-xs font-black uppercase text-indigo-600">
                VATTAMS Academy
              </p>
              <h2 className="text-2xl font-black mt-1">
                Competitions & Leaderboard
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Online competitions, verified results and student rankings.
              </p>
            </div>
          </div>

          <span className="rounded-xl bg-indigo-50 text-indigo-700 px-4 py-2 text-sm font-black">
            {competition.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase text-indigo-600">
              Featured Competition
            </p>
            <h3 className="text-2xl font-black mt-1">{competition.title}</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-2xl">
              {competition.description}
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black">
                {competition.category}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black inline-flex items-center gap-1">
                <Clock3 size={13} />
                {new Date(competition.startAt).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={register}
              disabled={registered}
              className="rounded-xl bg-indigo-600 disabled:bg-slate-300 text-white px-5 py-3 font-black"
            >
              {registered ? 'Registered' : 'Register'}
            </button>
          </div>
        </div>

        {message && (
          <p className="mt-4 rounded-2xl bg-indigo-50 p-4 text-sm font-bold text-indigo-900">
            {message}
          </p>
        )}
      </div>

      {myResult && (
        <div className="grid md:grid-cols-3 gap-3">
          <Summary label="Your Rank" value={`#${leaderboard.findIndex((item) => item.studentId === 'student-demo') + 1}`} />
          <Summary label="Your Score" value={`${myResult.score}/${myResult.maxScore}`} />
          <Summary
            label="Percentage"
            value={`${Math.round(calculatePercentage(myResult.score, myResult.maxScore))}%`}
          />
        </div>
      )}

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center gap-2">
          <Medal size={19} className="text-amber-600" />
          <h3 className="font-black">Leaderboard</h3>
        </div>

        <div className="space-y-2 mt-4">
          {leaderboard.map((result, index) => (
            <div
              key={`${result.studentId}-${result.competitionId}`}
              className={`rounded-2xl p-4 flex items-center gap-3 ${
                result.studentId === 'student-demo'
                  ? 'bg-indigo-50 border border-indigo-100'
                  : 'bg-slate-50'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-black">
                {index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-black truncate">{result.studentName}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {Math.round(calculatePercentage(result.score, result.maxScore))}%
                </p>
              </div>

              <div className="text-right">
                <p className="font-black">
                  {result.score}/{result.maxScore}
                </p>
                {index < 3 && (
                  <Award
                    size={16}
                    className="ml-auto mt-1 text-amber-500"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5">
        <div className="flex gap-3">
          <CheckCircle2 className="text-emerald-600 shrink-0" />
          <div>
            <p className="font-black text-emerald-950">
              Results workflow
            </p>
            <p className="text-sm text-emerald-900 mt-1">
              Competition result → score verification → rank calculation →
              published leaderboard → student result view.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5">
        <div className="flex gap-3">
          <ShieldCheck className="text-amber-600 shrink-0" />
          <div>
            <p className="font-black text-amber-950">
              Result security
            </p>
            <p className="text-sm text-amber-900 mt-1">
              Scores, ranks and result publication must be calculated and
              authorized server-side. Students must never be able to edit
              their own scores or rankings.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border rounded-2xl p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-2xl font-black mt-1">{value}</p>
    </div>
  );
}
