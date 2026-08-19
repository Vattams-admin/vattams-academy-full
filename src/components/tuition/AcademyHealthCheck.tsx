import { useState } from 'react';
import { CheckCircle2, RefreshCw, ShieldAlert, Wifi, XCircle } from 'lucide-react';
import {
  runAuthenticatedHealthCheck,
  runPublicHealthChecks,
  type HealthCheck,
} from '@/lib/academyHealth';

export default function AcademyHealthCheck() {
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    try {
      const publicChecks = await runPublicHealthChecks();

      const token =
        sessionStorage.getItem('vattams_student_token') ||
        sessionStorage.getItem('vattams_tutor_token') ||
        sessionStorage.getItem('vattams_admin_token') ||
        '';

      const authenticated = await runAuthenticatedHealthCheck(token);
      setChecks([...publicChecks, authenticated]);
    } finally {
      setRunning(false);
    }
  };

  return (
    <section className="bg-white border rounded-3xl p-5">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <p className="text-xs font-black uppercase text-indigo-600">VATTAMS Academy</p>
          <h2 className="text-xl font-black mt-1">System Health Check</h2>
          <p className="text-sm text-slate-500 mt-1">
            Quick browser, network, PWA and server reachability checks.
          </p>
        </div>

        <button
          type="button"
          onClick={run}
          disabled={running}
          className="rounded-xl bg-indigo-600 text-white px-4 py-2 font-black inline-flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw size={16} className={running ? 'animate-spin' : ''} />
          {running ? 'Checking...' : 'Run Check'}
        </button>
      </div>

      <div className="space-y-2 mt-5">
        {checks.map((check) => (
          <div key={check.name} className="rounded-2xl bg-slate-50 p-4 flex items-start gap-3">
            <StatusIcon status={check.status} />
            <div className="min-w-0 flex-1">
              <p className="font-black text-sm">{check.name}</p>
              <p className="text-xs text-slate-600 mt-1">{check.message}</p>
            </div>
            <span className="text-[10px] font-bold text-slate-400">
              {check.durationMs}ms
            </span>
          </div>
        ))}

        {!checks.length && (
          <div className="py-8 text-center text-sm text-slate-400">
            Run a check to test the current environment.
          </div>
        )}
      </div>
    </section>
  );
}

function StatusIcon({ status }: { status: HealthCheck['status'] }) {
  if (status === 'ok') return <CheckCircle2 className="text-emerald-600 shrink-0" size={20} />;
  if (status === 'warning') return <ShieldAlert className="text-amber-500 shrink-0" size={20} />;
  return <XCircle className="text-rose-600 shrink-0" size={20} />;
}
