import { useEffect, useState } from 'react';
import { CheckCircle2, PauseCircle, RefreshCw, XCircle } from 'lucide-react';
import {
  activateEnrollment,
  cancelEnrollment,
  completeEnrollment,
  listAdminEnrollments,
  pauseEnrollment,
} from '@/lib/tuitionEnrollment';

export default function TuitionAdminEnrollments() {
  const [items, setItems] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const result = await listAdminEnrollments();
      setItems(result.enrollments || []);
    } catch (e: any) {
      setMessage(e.message || 'Unable to load enrollments.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const run = async (
    action: 'activate' | 'pause' | 'complete' | 'cancel',
    id: string,
  ) => {
    try {
      if (action === 'activate') await activateEnrollment(id);
      if (action === 'pause') await pauseEnrollment(id);
      if (action === 'complete') await completeEnrollment(id);
      if (action === 'cancel') await cancelEnrollment(id);
      setMessage(`Enrollment ${action}d.`);
      await load();
    } catch (e: any) {
      setMessage(e.message || 'Unable to update enrollment.');
    }
  };

  return (
    <section className="bg-white border rounded-3xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase text-indigo-600">
            Academy
          </p>
          <h2 className="text-xl font-black">Enrollments & Access</h2>
        </div>
        <button type="button" onClick={load} className="p-2 rounded-xl border">
          <RefreshCw size={17} />
        </button>
      </div>

      {message && (
        <p className="mt-3 rounded-xl bg-indigo-50 p-3 text-sm font-semibold text-indigo-800">
          {message}
        </p>
      )}

      <div className="space-y-3 mt-5">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border p-4">
            <div className="flex justify-between gap-3">
              <div>
                <p className="font-black">Student: {item.student_id || '—'}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Course: {item.course_id || '—'}
                </p>
                <p className="text-xs text-slate-500">
                  Status: {item.status}
                </p>
                <p className="text-xs text-slate-500">
                  Payment: {item.payment_id || '—'}
                </p>
              </div>
              {item.status === 'active' ? (
                <CheckCircle2 className="text-emerald-600" />
              ) : item.status === 'paused' ? (
                <PauseCircle className="text-amber-600" />
              ) : (
                <XCircle className="text-slate-400" />
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {item.status !== 'active' && item.status !== 'completed' && item.status !== 'cancelled' && (
                <button
                  type="button"
                  onClick={() => run('activate', item.id)}
                  className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black"
                >
                  Activate
                </button>
              )}
              {item.status === 'active' && (
                <button
                  type="button"
                  onClick={() => run('pause', item.id)}
                  className="px-3 py-2 rounded-xl bg-amber-100 text-amber-800 text-xs font-black"
                >
                  Pause
                </button>
              )}
              {item.status === 'active' && (
                <button
                  type="button"
                  onClick={() => run('complete', item.id)}
                  className="px-3 py-2 rounded-xl bg-indigo-100 text-indigo-800 text-xs font-black"
                >
                  Complete
                </button>
              )}
              {item.status !== 'cancelled' && item.status !== 'completed' && (
                <button
                  type="button"
                  onClick={() => run('cancel', item.id)}
                  className="px-3 py-2 rounded-xl bg-red-50 text-red-700 text-xs font-black"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}

        {!items.length && (
          <p className="text-sm text-slate-400 text-center py-8">
            No enrollments found.
          </p>
        )}
      </div>
    </section>
  );
}
