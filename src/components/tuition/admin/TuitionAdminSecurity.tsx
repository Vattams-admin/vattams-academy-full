import { useEffect, useState } from 'react';
import { RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';
import {
  cleanupExpiredSessions,
  getSecuritySummary,
} from '@/lib/academySecurity';

export default function TuitionAdminSecurity() {
  const [summary, setSummary] = useState<any>(null);
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      setMessage('');
      setSummary(await getSecuritySummary());
    } catch (error: any) {
      setMessage(error.message || 'Unable to load security summary.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const cleanup = async () => {
    try {
      await cleanupExpiredSessions();
      setMessage('Expired Academy sessions cleaned.');
      await load();
    } catch (error: any) {
      setMessage(error.message || 'Unable to clean expired sessions.');
    }
  };

  return (
    <section className="space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex flex-wrap justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-emerald-600">Security</p>
            <h2 className="text-2xl font-black mt-1">Academy Security</h2>
            <p className="text-sm text-slate-500 mt-1">
              Session validation and security-event overview.
            </p>
          </div>

          <button
            type="button"
            onClick={load}
            className="rounded-xl border px-4 py-2 font-black inline-flex items-center gap-2"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {message && (
          <p className="mt-4 rounded-xl bg-indigo-50 p-3 text-sm text-indigo-800">
            {message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Metric label="Events / 30 days" value={summary?.totalEvents ?? '—'} />
        <Metric label="Successful" value={summary?.successfulEvents ?? '—'} />
        <Metric label="Failed" value={summary?.failedEvents ?? '—'} />
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center gap-2 font-black">
          <ShieldCheck size={19} className="text-emerald-600" />
          Event Types
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {Object.entries(summary?.byType || {}).map(([type, count]) => (
            <div key={type} className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">{type}</p>
              <p className="font-black mt-1">{String(count)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <h3 className="font-black">Session Maintenance</h3>
        <p className="text-sm text-slate-500 mt-1">
          Remove expired Student, Tutor and Admin Academy sessions only.
        </p>

        <button
          type="button"
          onClick={cleanup}
          className="mt-4 rounded-xl border border-rose-200 text-rose-700 px-4 py-2 font-black inline-flex items-center gap-2"
        >
          <Trash2 size={16} /> Clean Expired Sessions
        </button>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border rounded-2xl p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-2xl font-black mt-1">{value}</p>
    </div>
  );
}
