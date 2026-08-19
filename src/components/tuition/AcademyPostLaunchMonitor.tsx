import { useEffect, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Globe2,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react';
import {
  getRuntimeSummary,
  runPostLaunchSmokeChecks,
  type LaunchSmokeCheck,
} from '@/lib/academyPostLaunch';

export default function AcademyPostLaunchMonitor() {
  const [checks, setChecks] = useState<LaunchSmokeCheck[]>([]);
  const [runtime, setRuntime] = useState<any>(null);

  const run = () => {
    setChecks(runPostLaunchSmokeChecks());
    setRuntime(getRuntimeSummary());
  };

  useEffect(() => {
    run();
  }, []);

  const passed = checks.filter((item) => item.status === 'pass').length;

  return (
    <section className="space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex flex-wrap justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-emerald-600">
              Post-Launch
            </p>
            <h2 className="text-2xl font-black mt-1">Academy Monitor</h2>
            <p className="text-sm text-slate-500 mt-1">
              Lightweight browser-side smoke checks after deployment.
            </p>
          </div>

          <button
            type="button"
            onClick={run}
            className="rounded-xl border px-4 py-2 font-black inline-flex items-center gap-2"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Info icon={<Activity size={17} />} label="Smoke checks" value={`${passed}/${checks.length}`} />
        <Info icon={<Globe2 size={17} />} label="Host" value={runtime?.hostname || '—'} />
        <Info icon={<ShieldCheck size={17} />} label="HTTPS" value={runtime?.protocol || '—'} />
        <Info icon={<Activity size={17} />} label="Network" value={runtime?.online ? 'Online' : 'Offline'} />
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <h3 className="font-black">Post-Launch Smoke Checks</h3>
        <div className="space-y-3 mt-4">
          {checks.map((check) => (
            <div key={check.name} className="rounded-2xl border p-4 flex gap-3">
              {check.status === 'pass'
                ? <CheckCircle2 className="text-emerald-600 shrink-0" size={20} />
                : <TriangleAlert className="text-amber-600 shrink-0" size={20} />}
              <div>
                <p className="font-black text-sm">{check.name}</p>
                <p className="text-xs text-slate-500 mt-1">{check.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5">
        <p className="font-black text-emerald-950">Monitoring rule</p>
        <p className="text-sm text-emerald-900 mt-1">
          This monitor does not collect personal data or silently upload browser
          activity. Production monitoring should use an approved server-side
          observability service when one is configured.
        </p>
      </div>
    </section>
  );
}

function Info({
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
      <p className="font-black mt-2 break-words">{value}</p>
    </div>
  );
}
