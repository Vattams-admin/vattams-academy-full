import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Rocket,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react';
import { ACADEMY_RELEASE, getLaunchDaysRemaining } from '@/lib/academyRelease';

const checks = [
  {
    id: 'database',
    title: 'Existing Tuition data preserved',
    description: 'No destructive migration is part of Phase 40.',
  },
  {
    id: 'authentication',
    title: 'Authentication preserved',
    description: 'Student, Tutor and Admin authentication remain the source of truth.',
  },
  {
    id: 'payments',
    title: 'Payment/UTR logic preserved',
    description: 'No payment schema or approval logic is replaced by this phase.',
  },
  {
    id: 'security',
    title: 'Security gates documented',
    description: 'Session, RLS and role-access checks remain required before launch.',
  },
  {
    id: 'network',
    title: 'Network testing required',
    description: 'Wi-Fi, mobile data, slow network and reconnect testing remain mandatory.',
  },
  {
    id: 'backup',
    title: 'Backup readiness required',
    description: 'Managed Supabase backup availability must be confirmed before launch.',
  },
];

export default function AcademyReleaseCandidate() {
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    const onError = () => setErrorCount((value) => value + 1);
    window.addEventListener('vattams:academy-error', onError);
    return () => window.removeEventListener('vattams:academy-error', onError);
  }, []);

  const complete = useMemo(
    () => checks.every((item) => confirmed[item.id]),
    [confirmed],
  );

  const days = getLaunchDaysRemaining();

  return (
    <section className="space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600">
              <Rocket size={20} />
              <p className="text-xs font-black uppercase">Release Candidate</p>
            </div>
            <h2 className="text-2xl font-black mt-2">{ACADEMY_RELEASE.product}</h2>
            <p className="text-sm text-slate-500 mt-1">{ACADEMY_RELEASE.tagline}</p>
          </div>

          <div className="rounded-2xl bg-indigo-50 px-4 py-3">
            <p className="text-xs text-indigo-600 font-black">VERSION</p>
            <p className="font-black text-indigo-950">{ACADEMY_RELEASE.version}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <InfoCard
          icon={<CalendarDays size={18} />}
          label="Launch"
          value={formatDate(ACADEMY_RELEASE.targetLaunchDate)}
        />
        <InfoCard
          icon={<CalendarDays size={18} />}
          label="Development"
          value={formatDate(ACADEMY_RELEASE.developmentCompleteDate)}
        />
        <InfoCard
          icon={<ClipboardCheck size={18} />}
          label="Testing"
          value="Sep 3–4"
        />
        <InfoCard
          icon={<Rocket size={18} />}
          label="Days remaining"
          value={days >= 0 ? String(days) : 'Launch date passed'}
        />
      </div>

      <div className={`rounded-3xl border p-5 ${
        complete
          ? 'bg-emerald-50 border-emerald-200'
          : 'bg-amber-50 border-amber-200'
      }`}>
        <div className="flex items-start gap-3">
          {complete
            ? <CheckCircle2 className="text-emerald-600 shrink-0" />
            : <TriangleAlert className="text-amber-600 shrink-0" />}
          <div>
            <p className="font-black">
              {complete ? 'Release checklist acknowledged' : 'Release checklist pending'}
            </p>
            <p className="text-sm mt-1 text-slate-700">
              This acknowledgement does not automatically deploy or publish the application.
              Real production tests remain mandatory.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center gap-2">
          <ShieldCheck size={19} className="text-indigo-600" />
          <h3 className="font-black">Final Release Checklist</h3>
        </div>

        <div className="space-y-3 mt-5">
          {checks.map((item) => {
            const checked = Boolean(confirmed[item.id]);

            return (
              <label
                key={item.id}
                className="flex items-start gap-3 rounded-2xl border p-4 cursor-pointer hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) =>
                    setConfirmed((current) => ({
                      ...current,
                      [item.id]: event.target.checked,
                    }))
                  }
                  className="mt-1 w-4 h-4"
                />
                <span>
                  <span className="block font-black text-sm">{item.title}</span>
                  <span className="block text-xs text-slate-500 mt-1">
                    {item.description}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-black">Runtime Errors Since Opening</h3>
            <p className="text-xs text-slate-500 mt-1">
              Browser-session count only; no remote telemetry is enabled by Phase 40.
            </p>
          </div>
          <span className={`text-2xl font-black ${
            errorCount === 0 ? 'text-emerald-600' : 'text-rose-600'
          }`}>
            {errorCount}
          </span>
        </div>
      </div>
    </section>
  );
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white border rounded-2xl p-4">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-xs font-black uppercase">{label}</span>
      </div>
      <p className="font-black mt-2">{value}</p>
    </div>
  );
}
