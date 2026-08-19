import { useMemo } from 'react';
import {
  CheckCircle2,
  CircleAlert,
  LockKeyhole,
  Rocket,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import {
  getProductionReadiness,
  REQUIRED_PRODUCTION_CHECKS,
  type CheckStatus,
} from '@/lib/academyProductionReadiness';

export default function AcademyProductionReadiness() {
  const readiness = useMemo(
    () => getProductionReadiness(),
    [],
  );

  return (
    <section className="space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-indigo-50 text-indigo-600 p-3">
              <Rocket size={22} />
            </div>
            <div>
              <p className="text-xs font-black uppercase text-indigo-600">
                VATTAMS Academy
              </p>
              <h2 className="text-2xl font-black mt-1">
                Final Integration & Production QA
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Final release gate for authentication, security, data,
                payments, UI and deployment.
              </p>
            </div>
          </div>

          <span className="rounded-xl bg-amber-50 text-amber-700 px-4 py-2 text-sm font-black">
            {readiness.warnings} checks need verification
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Summary label="Total Checks" value={readiness.total} />
        <Summary label="Passed" value={readiness.passes} />
        <Summary label="Warnings" value={readiness.warnings} />
        <Summary label="Failures" value={readiness.failures} />
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <div className="space-y-2">
          {REQUIRED_PRODUCTION_CHECKS.map((check) => (
            <div
              key={check.id}
              className="rounded-2xl bg-slate-50 p-4 flex gap-3"
            >
              <StatusIcon status={check.status} />
              <div className="flex-1">
                <div className="flex flex-wrap justify-between gap-2">
                  <p className="font-black">{check.title}</p>
                  <span className="text-xs font-black uppercase text-slate-500">
                    {check.category}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  {check.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5">
        <div className="flex gap-3">
          <ShieldCheck className="text-emerald-600 shrink-0" />
          <div>
            <p className="font-black text-emerald-950">
              Release principle
            </p>
            <p className="text-sm text-emerald-900 mt-1">
              Phase 69 does not silently mark unverified production checks as
              passed. Real-device, production-environment verification must be
              completed before the final release is declared production-ready.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5">
        <div className="flex gap-3">
          <LockKeyhole className="text-amber-600 shrink-0" />
          <div>
            <p className="font-black text-amber-950">
              Final deployment checklist
            </p>
            <ul className="text-sm text-amber-900 mt-2 space-y-1 list-disc pl-5">
              <li>Run build and type checks.</li>
              <li>Test every login role.</li>
              <li>Test Wi-Fi → mobile data network switching.</li>
              <li>Verify RLS with unauthorized access attempts.</li>
              <li>Verify payment duplicate protection.</li>
              <li>Verify existing historical records remain intact.</li>
              <li>Test mobile-first screens on real Android devices.</li>
              <li>Verify HTTPS, domain and production environment variables.</li>
              <li>Back up production database before schema changes.</li>
              <li>Deploy only after a successful staging smoke test.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <p className="font-black">Phase 1 → 69 preservation rule</p>
        <p className="text-sm text-slate-500 mt-1">
          Existing students, tutors, historical selections, authentication,
          tutor fee/approval logic, Home Services functionality, RLS and
          historical database values must remain intact unless a separately
          approved migration explicitly changes them.
        </p>
      </div>
    </section>
  );
}

function Summary({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white border rounded-2xl p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-2xl font-black mt-1">{value}</p>
    </div>
  );
}

function StatusIcon({ status }: { status: CheckStatus }) {
  if (status === 'pass') {
    return <CheckCircle2 className="text-emerald-600 shrink-0" />;
  }

  if (status === 'fail') {
    return <XCircle className="text-red-600 shrink-0" />;
  }

  return <CircleAlert className="text-amber-600 shrink-0" />;
}
