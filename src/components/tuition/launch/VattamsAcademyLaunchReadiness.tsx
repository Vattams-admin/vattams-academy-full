import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  LockKeyhole,
  Network,
  ShieldCheck,
} from 'lucide-react';

type Check = {
  id: string;
  title: string;
  description: string;
  required: boolean;
};

const CHECKS: Check[] = [
  {
    id: 'student-login',
    title: 'Student login',
    description: 'Verify login on home Wi-Fi, mobile data and a second Wi-Fi.',
    required: true,
  },
  {
    id: 'tutor-login',
    title: 'Tutor login',
    description: 'Verify tutor registration/login/session on all three networks.',
    required: true,
  },
  {
    id: 'admin-login',
    title: 'Admin login',
    description: 'Verify admin login, dashboard and logout on all three networks.',
    required: true,
  },
  {
    id: 'student-registration',
    title: 'Student registration',
    description: 'Create a test student and confirm the record appears in the dashboard.',
    required: true,
  },
  {
    id: 'tutor-registration',
    title: 'Tutor registration',
    description: 'Submit registration + payment/UTR and verify the existing approval workflow.',
    required: true,
  },
  {
    id: 'course-flow',
    title: 'Course flow',
    description: 'Course → level → module/lesson → material works end-to-end.',
    required: true,
  },
  {
    id: 'classroom',
    title: 'Classroom',
    description: 'Tutor can conduct a class and student can enter the class.',
    required: true,
  },
  {
    id: 'attendance',
    title: 'Attendance',
    description: 'Tutor attendance entry is reflected correctly for the student.',
    required: true,
  },
  {
    id: 'assessment',
    title: 'Assignments & tests',
    description: 'Student submission, scoring and result display work.',
    required: true,
  },
  {
    id: 'progress',
    title: 'Progress analytics',
    description: 'Lesson, assessment and attendance progress calculates correctly.',
    required: true,
  },
  {
    id: 'competitions',
    title: 'Competitions',
    description: 'Registration, competition attempt, score and leaderboard work.',
    required: true,
  },
  {
    id: 'certificate',
    title: 'Certificates',
    description: 'Admin issue/revoke and public verification work.',
    required: true,
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'In-app notifications and announcements work.',
    required: true,
  },
  {
    id: 'no-home-services',
    title: 'Academy-only product',
    description: 'Final navigation and launch pages contain no Home Services entry points.',
    required: true,
  },
  {
    id: 'rls',
    title: 'Security / RLS',
    description: 'Existing RLS and role boundaries are verified without weakening policies.',
    required: true,
  },
  {
    id: 'production',
    title: 'Production configuration',
    description: 'Production environment variables, domain and HTTPS are verified.',
    required: true,
  },
];

export default function VattamsAcademyLaunchReadiness() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);

  const completed = useMemo(
    () => CHECKS.filter((check) => done[check.id]).length,
    [done],
  );

  const percent = Math.round((completed / CHECKS.length) * 100);
  const ready = completed === CHECKS.length;

  const visibleChecks = showOnlyOpen
    ? CHECKS.filter((check) => !done[check.id])
    : CHECKS;

  return (
    <section className="bg-white border border-slate-200 rounded-3xl shadow-sm p-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <ClipboardCheck size={22} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-indigo-600">
              VATTAMS Academy
            </p>
            <h2 className="text-xl font-black">Launch Readiness</h2>
          </div>
        </div>

        <div className="text-right">
          <p className="text-3xl font-black">{percent}%</p>
          <p className="text-xs text-slate-500">
            {completed}/{CHECKS.length} checks completed
          </p>
        </div>
      </div>

      <div className="h-3 bg-slate-100 rounded-full overflow-hidden mt-5">
        <div
          className="h-full bg-indigo-600 rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
        <div className="rounded-2xl border p-3">
          <Network className="text-indigo-600" size={19} />
          <p className="text-xs text-slate-500 mt-2">Networks</p>
          <p className="font-black text-sm">3 required</p>
        </div>
        <div className="rounded-2xl border p-3">
          <LockKeyhole className="text-emerald-600" size={19} />
          <p className="text-xs text-slate-500 mt-2">Security</p>
          <p className="font-black text-sm">RLS + roles</p>
        </div>
        <div className="rounded-2xl border p-3">
          <ShieldCheck className="text-amber-600" size={19} />
          <p className="text-xs text-slate-500 mt-2">Production</p>
          <p className="font-black text-sm">HTTPS required</p>
        </div>
        <div className="rounded-2xl border p-3">
          {ready ? (
            <CheckCircle2 className="text-emerald-600" size={19} />
          ) : (
            <AlertTriangle className="text-amber-600" size={19} />
          )}
          <p className="text-xs text-slate-500 mt-2">Status</p>
          <p className="font-black text-sm">{ready ? 'READY' : 'TESTING'}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 mb-3">
        <h3 className="font-black">Required checks</h3>
        <button
          type="button"
          onClick={() => setShowOnlyOpen((value) => !value)}
          className="text-xs font-bold text-indigo-600"
        >
          {showOnlyOpen ? 'Show all' : 'Show open only'}
        </button>
      </div>

      <div className="space-y-2">
        {visibleChecks.map((check) => {
          const isDone = !!done[check.id];

          return (
            <button
              key={check.id}
              type="button"
              onClick={() =>
                setDone((old) => ({ ...old, [check.id]: !old[check.id] }))
              }
              className={`w-full text-left rounded-2xl border p-4 transition ${
                isDone
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex gap-3">
                {isDone ? (
                  <CheckCircle2 className="text-emerald-600 shrink-0" size={20} />
                ) : (
                  <Circle className="text-slate-300 shrink-0" size={20} />
                )}

                <div>
                  <p className="font-bold text-sm">{check.title}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {check.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {!ready && (
        <div className="mt-5 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
          Do not treat this screen as proof of production readiness. Each item
          must be physically tested and checked off by the launch team.
        </div>
      )}

      {ready && (
        <div className="mt-5 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-bold text-emerald-800">
          All listed checks have been marked complete. Perform one final clean
          production test before launch.
        </div>
      )}
    </section>
  );
}
