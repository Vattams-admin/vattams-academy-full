import { useEffect, useState } from 'react';
import {
  Accessibility,
  CheckCircle2,
  Gauge,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  XCircle,
} from 'lucide-react';
import {
  getAccessibilityChecks,
  getPerformanceSnapshot,
  type PerformanceSnapshot,
} from '@/lib/academyPerformance';

export default function AcademyLaunchGate() {
  const [performance, setPerformance] = useState<PerformanceSnapshot | null>(null);
  const [accessibility, setAccessibility] = useState<any>(null);

  const run = () => {
    setPerformance(getPerformanceSnapshot());
    setAccessibility(getAccessibilityChecks());
  };

  useEffect(() => {
    const timer = window.setTimeout(run, 300);
    return () => window.clearTimeout(timer);
  }, []);

  const performancePass =
    performance &&
    (performance.firstContentfulPaintMs === null || performance.firstContentfulPaintMs < 3000) &&
    (performance.domContentLoadedMs === null || performance.domContentLoadedMs < 5000);

  const accessibilityPass =
    accessibility &&
    accessibility.rootExists &&
    accessibility.missingAlt === 0 &&
    accessibility.unnamedButtons === 0 &&
    accessibility.unnamedLinks === 0 &&
    accessibility.languageDeclared;

  return (
    <section className="space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex flex-wrap justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-indigo-600">Final Launch Gate</p>
            <h2 className="text-2xl font-black mt-1">Performance & Accessibility</h2>
            <p className="text-sm text-slate-500 mt-1">
              Quick client-side checks before production testing.
            </p>
          </div>

          <button
            type="button"
            onClick={run}
            className="rounded-xl border px-4 py-2 font-black inline-flex items-center gap-2"
          >
            <RefreshCw size={16} /> Recheck
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <StatusCard
          icon={<Gauge size={19} />}
          title="Performance"
          value={performancePass ? 'PASS' : 'REVIEW'}
          ok={Boolean(performancePass)}
        />
        <StatusCard
          icon={<Accessibility size={19} />}
          title="Accessibility"
          value={accessibilityPass ? 'PASS' : 'REVIEW'}
          ok={Boolean(accessibilityPass)}
        />
        <StatusCard
          icon={<Smartphone size={19} />}
          title="Online State"
          value={performance?.online ? 'ONLINE' : 'OFFLINE'}
          ok={Boolean(performance?.online)}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white border rounded-3xl p-5">
          <h3 className="font-black">Performance Snapshot</h3>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Metric label="First Contentful Paint" value={formatMs(performance?.firstContentfulPaintMs)} />
            <Metric label="DOM Content Loaded" value={formatMs(performance?.domContentLoadedMs)} />
            <Metric label="Page Load" value={formatMs(performance?.loadMs)} />
            <Metric label="Connection" value={performance?.connection || 'Unknown'} />
          </div>
        </div>

        <div className="bg-white border rounded-3xl p-5">
          <h3 className="font-black">Accessibility Snapshot</h3>
          <div className="space-y-3 mt-4">
            <CheckRow label="Root application exists" ok={Boolean(accessibility?.rootExists)} />
            <CheckRow label="Images have alt attributes" ok={accessibility?.missingAlt === 0} count={accessibility?.missingAlt} />
            <CheckRow label="Buttons have accessible names" ok={accessibility?.unnamedButtons === 0} count={accessibility?.unnamedButtons} />
            <CheckRow label="Links have accessible names" ok={accessibility?.unnamedLinks === 0} count={accessibility?.unnamedLinks} />
            <CheckRow label="Inputs have labels" ok={accessibility?.unlabeledInputs === 0} count={accessibility?.unlabeledInputs} />
            <CheckRow label="HTML language is declared" ok={Boolean(accessibility?.languageDeclared)} />
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-5">
        <div className="flex gap-3">
          <ShieldCheck className="text-indigo-600 shrink-0" />
          <div>
            <p className="font-black text-indigo-950">Release reminder</p>
            <p className="text-sm text-indigo-900 mt-1">
              These are automated smoke checks, not a substitute for real-device,
              real-network, authentication, payment and role-security testing.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function formatMs(value: number | null | undefined) {
  return value == null ? '—' : `${value} ms`;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-black mt-1">{value}</p>
    </div>
  );
}

function CheckRow({
  label,
  ok,
  count,
}: {
  label: string;
  ok: boolean;
  count?: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
      <div className="flex items-center gap-2">
        {ok
          ? <CheckCircle2 size={17} className="text-emerald-600" />
          : <XCircle size={17} className="text-rose-600" />}
        <span className="text-sm font-bold">{label}</span>
      </div>
      {typeof count === 'number' && !ok && (
        <span className="text-xs font-black text-rose-600">{count}</span>
      )}
    </div>
  );
}

function StatusCard({
  icon,
  title,
  value,
  ok,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  ok: boolean;
}) {
  return (
    <div className="bg-white border rounded-2xl p-4">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-xs font-black uppercase">{title}</span>
      </div>
      <p className={`text-2xl font-black mt-2 ${ok ? 'text-emerald-600' : 'text-amber-600'}`}>
        {value}
      </p>
    </div>
  );
}
