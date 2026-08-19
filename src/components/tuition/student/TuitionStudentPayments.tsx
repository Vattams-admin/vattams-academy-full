import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  FileCheck2,
  XCircle,
} from 'lucide-react';
import {
  createPayment,
  getPaymentSettings,
  listMyPayments,
  submitPaymentProof,
} from '@/lib/tuitionPayments';

export default function TuitionStudentPayments() {
  const [settings, setSettings] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState('course_fee');
  const [paymentId, setPaymentId] = useState('');
  const [utr, setUtr] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const [settingResult, paymentResult] = await Promise.all([
        getPaymentSettings(),
        listMyPayments(),
      ]);
      setSettings(settingResult.settings || null);
      setPayments(paymentResult.payments || []);
    } catch (e: any) {
      setMessage(e.message || 'Unable to load payment details.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setMessage('Enter a valid amount.');
      return;
    }

    try {
      const result = await createPayment({
        amount: value,
        paymentType,
        paymentMethod: 'upi',
      });
      setPaymentId(result.payment.id);
      setMessage('Payment record created. Complete the payment and submit your UTR.');
      await load();
    } catch (e: any) {
      setMessage(e.message || 'Unable to create payment.');
    }
  };

  const submit = async () => {
    if (!paymentId || !utr.trim()) {
      setMessage('Select a payment and enter the UTR/transaction reference.');
      return;
    }

    try {
      await submitPaymentProof({
        paymentId,
        utrNumber: utr.trim(),
      });
      setMessage('Payment proof submitted for Admin verification.');
      setPaymentId('');
      setUtr('');
      await load();
    } catch (e: any) {
      setMessage(e.message || 'Unable to submit payment proof.');
    }
  };

  return (
    <section className="space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <CreditCard size={21} />
          </div>
          <div>
            <p className="text-xs font-black uppercase text-indigo-600">
              Academy Payments
            </p>
            <h2 className="text-xl font-black">Payment Details</h2>
          </div>
        </div>

        {settings && (
          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm space-y-1">
            <p className="font-black">{settings.display_name}</p>
            {settings.upi_id && (
              <p><strong>UPI:</strong> {settings.upi_id}</p>
            )}
            {settings.account_name && (
              <p><strong>Account:</strong> {settings.account_name}</p>
            )}
            {settings.bank_name && (
              <p><strong>Bank:</strong> {settings.bank_name}</p>
            )}
            {settings.account_number_last4 && (
              <p><strong>Account ending:</strong> ****{settings.account_number_last4}</p>
            )}
            {settings.ifsc && (
              <p><strong>IFSC:</strong> {settings.ifsc}</p>
            )}
            {settings.payment_instructions && (
              <p className="pt-2 text-slate-600">{settings.payment_instructions}</p>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-2 mt-5">
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            placeholder="Amount (₹)"
            className="px-4 py-3 rounded-xl border"
          />
          <select
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
            className="px-4 py-3 rounded-xl border"
          >
            <option value="course_fee">Course Fee</option>
            <option value="enrollment_fee">Enrollment Fee</option>
            <option value="trial_fee">Trial Fee</option>
            <option value="exam_fee">Exam Fee</option>
            <option value="competition_fee">Competition Fee</option>
            <option value="certificate_fee">Certificate Fee</option>
            <option value="other">Other</option>
          </select>

          <button
            type="button"
            onClick={create}
            className="rounded-xl bg-indigo-600 text-white font-black"
          >
            Create Payment
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-2 mt-3">
          <select
            value={paymentId}
            onChange={(e) => setPaymentId(e.target.value)}
            className="px-4 py-3 rounded-xl border"
          >
            <option value="">Select pending payment</option>
            {payments
              .filter((p) => ['pending', 'submitted'].includes(p.status))
              .map((p) => (
                <option key={p.id} value={p.id}>
                  ₹{Number(p.amount).toFixed(2)} · {p.payment_type} · {p.status}
                </option>
              ))}
          </select>

          <input
            value={utr}
            onChange={(e) => setUtr(e.target.value)}
            placeholder="UTR / transaction reference"
            className="px-4 py-3 rounded-xl border"
          />
        </div>

        <button
          type="button"
          onClick={submit}
          className="mt-3 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white font-black"
        >
          <FileCheck2 size={17} />
          Submit Payment Proof
        </button>

        {message && (
          <p className="mt-3 rounded-xl bg-indigo-50 text-indigo-800 p-3 text-sm font-semibold">
            {message}
          </p>
        )}
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <h2 className="text-xl font-black">Payment History</h2>

        <div className="space-y-3 mt-5">
          {payments.map((payment) => {
            const statusIcon =
              payment.status === 'verified' ? (
                <CheckCircle2 className="text-emerald-600" size={19} />
              ) : payment.status === 'rejected' ? (
                <XCircle className="text-red-600" size={19} />
              ) : (
                <Clock3 className="text-amber-600" size={19} />
              );

            return (
              <div key={payment.id} className="border rounded-2xl p-4">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-black">
                      ₹{Number(payment.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {payment.payment_type} · {payment.created_at}
                    </p>
                    {payment.utr_number && (
                      <p className="text-xs text-slate-500 mt-1">
                        UTR: {payment.utr_number}
                      </p>
                    )}
                  </div>
                  {statusIcon}
                </div>
              </div>
            );
          })}

          {!payments.length && (
            <p className="text-sm text-slate-400">
              No Academy payments yet.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
