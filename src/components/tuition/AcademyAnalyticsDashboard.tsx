import { useEffect, useState } from 'react';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Gauge,
  Globe2,
  RefreshCw,
  Smartphone,
} from 'lucide-react';
import {
  captureAcademyAnalyticsSnapshot,
  measureWebVitalsSnapshot,
} from '@/lib/academyAnalytics';

export default function AcademyAnalyticsDashboard() {
  const [snapshot, setSnapshot] = useState<any>(null);
  const [vitals, setVitals] = useState<any>(null);

  const refresh = () => {
    setSnapshot(captureAcademyAnalyticsSnapshot());
    setVitals(measureWebVitalsSnapshot());
  };

  useEffect(() => {
    const timer = window.setTimeout(refresh, 250);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex flex-wrap justify-between items-start gap-3">
          <div>
            <p className="text-xs font-black uppercase text-indigo-600">
              Analytics
            </p>
            <h2 className="text-2xl font-black mt-1">
              VATTAMS Academy Insights
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Lightweight client-side operational metrics for release monitoring.
            </p>
          </div>

          <button
            type="button"
            onClick={refresh}
            className="rounded-xl border px-4 py-2 font-black inline-flex items-center gap-2"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Metric
          icon={<Activity size={18} />}
          label="Network"
          value={snapshot?.online ? 'Online' : 'Offline'}
        />
        <Metric
          icon={<Smartphone size={18} />}
          label="App Mode"
          value={snapshot?.standalone ? 'PWA' : 'Browser'}
        />
        <Metric
          icon={<Gauge size={18} />}
          label="FCP"
          value={formatMs(vitals?.fcpMs)}
        />
        <Metric
          icon={<Globe2 size={18} />}
          label="Environment"
          value={snapshot?.environment || '—'}
        />
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center gap-2">
          <BarChart3 size={19} className="text-indigo-600" />
          <h3 className="font-black">Performance Snapshot</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-3 mt-4">
          <ValueCard
            label="First Contentful Paint"
            value={formatMs(vitals?.fcpMs)}
          />
          <ValueCard
            label="DOM Content Loaded"
            value={formatMs(vitals?.domContentLoadedMs)}
          />
          <ValueCard
            label="Page Load"
            value={formatMs(vitals?.loadMs)}
          />
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <h3 className="font-black">Operational Snapshot</h3>

        <div className="space-y-3 mt-4">
          <Row
            label="Current route"
            value={snapshot?.route || '—'}
          />
          <Row
            label="Network state"
            value={snapshot?.online ? 'Online' : 'Offline'}
          />
          <Row
            label="Application mode"
            value={snapshot?.standalone ? 'Installed PWA' : 'Web Browser'}
          />
          <Row
            label="Captured"
            value={
              snapshot?.capturedAt
                ? new Date(snapshot.capturedAt).toLocaleString('en-IN')
                : '—'
            }
          />
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5">
        <div className="flex gap-3">
          <CheckCircle2 className="text-emerald-600 shrink-0" />
          <div>
            <p className="font-black text-emerald-950">
              Privacy-safe analytics foundation
            </p>
            <p className="text-sm text-emerald-900 mt-1">
              Phase 44 does not silently transmit personal data or create a
              third-party tracking profile. Server-side analytics can be connected
              later through an approved privacy-reviewed implementation.
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

function Metric({
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
      <p className="font-black text-lg mt-2 break-words">{value}</p>
    </div>
  );
}

function ValueCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-xl font-black mt-1">{value}</p>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-wrap justify-between gap-3 rounded-xl bg-slate-50 p-3">
      <span className="text-sm font-bold text-slate-600">{label}</span>
      <span className="text-sm font-black break-all">{value}</span>
    </div>
  );
}
