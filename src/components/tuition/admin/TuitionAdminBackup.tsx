import { useEffect, useState } from 'react';
import {
  DatabaseBackup,
  FileCheck2,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import {
  createBackupManifest,
  getBackupManifest,
  getBackupReadiness,
  getRecoveryChecklist,
} from '@/lib/academyBackup';

export default function TuitionAdminBackup() {
  const [readiness, setReadiness] = useState<any>(null);
  const [manifest, setManifest] = useState<any>(null);
  const [checklist, setChecklist] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      setMessage('');
      const [r, m, c] = await Promise.all([
        getBackupReadiness(),
        getBackupManifest(),
        getRecoveryChecklist(),
      ]);
      setReadiness(r);
      setManifest(m);
      setChecklist(c.checklist || []);
    } catch (error: any) {
      setMessage(error.message || 'Unable to load backup readiness.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const recordManifest = async () => {
    try {
      await createBackupManifest({
        scope: 'academy',
        parameters: {
          phase: 38,
          requestedFrom: 'Admin Backup Readiness',
        },
      });
      setMessage('Backup manifest recorded. This does not replace the managed database backup.');
      await load();
    } catch (error: any) {
      setMessage(error.message || 'Unable to record backup manifest.');
    }
  };

  const okCount = (readiness?.tables || []).filter(
    (item: any) => item.status === 'ok'
  ).length;

  return (
    <section className="space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex flex-wrap justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-emerald-600">Data Protection</p>
            <h2 className="text-2xl font-black mt-1">Backup & Recovery</h2>
            <p className="text-sm text-slate-500 mt-1">
              Verify backup readiness and recovery coverage without modifying Academy data.
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Metric label="Tables checked" value={readiness?.tables?.length ?? '—'} />
        <Metric label="Available" value={okCount} />
        <Metric label="Database reachable" value={readiness?.databaseReachable ? 'Yes' : '—'} />
        <Metric label="Phase" value="38" />
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center gap-2 font-black">
          <DatabaseBackup size={19} className="text-indigo-600" />
          Backup Readiness Inventory
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 pr-4 text-xs text-slate-500">Table</th>
                <th className="py-2 pr-4 text-xs text-slate-500">Status</th>
                <th className="py-2 pr-4 text-xs text-slate-500">Rows</th>
              </tr>
            </thead>
            <tbody>
              {(readiness?.tables || []).map((item: any) => (
                <tr key={item.table} className="border-b last:border-0">
                  <td className="py-3 pr-4 font-bold">{item.table}</td>
                  <td className="py-3 pr-4">
                    <span className={item.status === 'ok' ? 'text-emerald-700 font-black' : 'text-rose-700 font-black'}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4">{item.count ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center gap-2 font-black">
          <FileCheck2 size={19} className="text-indigo-600" />
          Recovery Checklist
        </div>

        <div className="space-y-2 mt-4">
          {checklist.map((item, index) => (
            <div key={index} className="flex items-start gap-2 text-sm">
              <ShieldCheck size={16} className="text-emerald-600 mt-0.5 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5">
        <p className="font-black text-amber-900">Important</p>
        <p className="text-sm text-amber-800 mt-1">
          This feature creates a backup-readiness inventory and audit manifest.
          It does not expose a database dump to the browser and does not replace
          Supabase managed backups or an approved export process.
        </p>

        <button
          type="button"
          onClick={recordManifest}
          className="mt-4 rounded-xl bg-amber-600 text-white px-4 py-2 font-black"
        >
          Record Backup Manifest
        </button>
      </div>

      {manifest?.recentReportSnapshots?.length > 0 && (
        <div className="bg-white border rounded-3xl p-5">
          <h3 className="font-black">Recent Recorded Manifests / Snapshots</h3>
          <div className="space-y-2 mt-4">
            {manifest.recentReportSnapshots.map((item: any, index: number) => (
              <div key={index} className="rounded-xl bg-slate-50 p-3 text-sm">
                <span className="font-black">{item.report_type}</span>
                <span className="text-slate-500 ml-2">
                  {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
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
