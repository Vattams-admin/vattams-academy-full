import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  CreditCard,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import {
  listAdminPayments,
  verifyPayment,
} from '@/lib/tuitionPayments';

export default function TuitionAdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setBusy(true);
    try {
      const result = await listAdminPayments();
      setPayments(result.payments || []);
    } catch (e: any) {
      setMessage(e.message || 'Unable to load payments.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const verify = async (id: string, status: 'verified' | 'rejected') => {
    try {
      await verifyPayment(id, status);
      setMessage(status === 'verified' ? 'Payment verified.' : 'Payment rejected.');
      await load();
    } catch (e: any) {
      setMessage(e.message || 'Unable to update payment.');
    }
  };

  return (
    <section className="bg-white border rounded-3xl p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <CreditCard size={19} />
          </div>
          <div>
            <p className="text-xs font-black uppercase text-indigo-600">
              Finance
            </p>
            <h2 className="text-xl font-black">Academy Payments</h2>
          </div>
        </div>

        <button
          type="button"
          onClick={load}
          className="p-2 rounded-xl border"
        >
          <RefreshCw size={17} className={busy ? 'animate-spin' : ''} />
        </button>
      </div>

      {message && (
        <p className="mt-3 bg-indigo-50 text-indigo-800 rounded-xl p-3 text-sm font-semibold">
          {message}
        </p>
      )}

      <div className="space-y-3 mt-5">
        {payments.map((payment) => (
          <div key={payment.id} className="border rounded-2xl p-4">
            <div className="flex justify-between gap-3">
              <div>
                <p className="font-black">
                  ₹{Number(payment.amount).toFixed(2)}
                </p>
                <p className="text-sm text-slate-700 mt-1">
                  {payment.payment_type}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Student: {payment.student_id || '—'}
                </p>
                <p className="text-xs text-slate-500">
                  UTR: {payment.utr_number || 'Not submitted'}
                </p>
                <p className="text-xs text-slate-500">
                  Status: {payment.status}
                </p>
              </div>

              {payment.status === 'verified' ? (
                <CheckCircle2 className="text-emerald-600 shrink-0" />
              ) : payment.status === 'rejected' ? (
                <XCircle className="text-red-600 shrink-0" />
              ) : null}
            </div>

            {['pending', 'submitted'].includes(payment.status) && (
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => verify(payment.id, 'verified')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-black"
                >
                  Verify
                </button>
                <button
                  type="button"
                  onClick={() => verify(payment.id, 'rejected')}
                  className="px-4 py-2 rounded-xl bg-red-50 text-red-700 text-sm font-black"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}

        {!payments.length && (
          <p className="text-sm text-slate-400 text-center py-8">
            No Academy payment records found.
          </p>
        )}
      </div>
    </section>
  );
}
