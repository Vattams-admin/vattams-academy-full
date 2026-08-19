import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  CreditCard,
  IndianRupee,
  ReceiptText,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import {
  calculateOutstanding,
  createPaymentSubmission,
  type AcademyFee,
  type AcademyPayment,
  type AcademyPaymentMethod,
} from '@/lib/academyPayments';

const DEMO_FEE: AcademyFee = {
  id: 'course-fee-demo',
  name: 'Academy Course Fee',
  description: 'Course fee payable for the selected Academy course.',
  amount: 5000,
  currency: 'INR',
  active: true,
};

export default function AcademyPaymentFeeCenter({
  fee = DEMO_FEE,
  verifiedPayments = [],
}: {
  fee?: AcademyFee;
  verifiedPayments?: number[];
}) {
  const [method, setMethod] = useState<AcademyPaymentMethod>('gpay');
  const [utr, setUtr] = useState('');
  const [payment, setPayment] = useState<AcademyPayment | null>(null);
  const [message, setMessage] = useState('');

  const outstanding = useMemo(
    () => calculateOutstanding(fee.amount, verifiedPayments),
    [fee.amount, verifiedPayments],
  );

  const submit = () => {
    try {
      const created = createPaymentSubmission({
        studentId: 'student-demo',
        purpose: 'course_fee',
        amount: outstanding,
        method,
        utr,
      });
      setPayment(created);
      setMessage(
        'Payment reference submitted. It must be verified by the authorized admin before the fee is treated as paid.',
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Unable to submit payment.',
      );
    }
  };

  return (
    <section className="space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-indigo-50 text-indigo-600 p-3">
              <CreditCard size={22} />
            </div>
            <div>
              <p className="text-xs font-black uppercase text-indigo-600">
                Academy Finance
              </p>
              <h2 className="text-2xl font-black mt-1">
                Payment & Fee Center
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                View fees and submit a UPI/GPay transaction reference for verification.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-emerald-50 text-emerald-700 px-4 py-2 text-sm font-black">
            INR
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <MoneyCard label="Fee" amount={fee.amount} />
        <MoneyCard
          label="Verified Paid"
          amount={verifiedPayments.reduce((sum, value) => sum + value, 0)}
        />
        <MoneyCard label="Outstanding" amount={outstanding} />
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center gap-2">
          <ReceiptText size={19} className="text-indigo-600" />
          <h3 className="font-black">{fee.name}</h3>
        </div>

        <p className="text-sm text-slate-500 mt-2">{fee.description}</p>

        <div className="mt-5 rounded-2xl bg-slate-50 p-5">
          <div className="flex justify-between gap-3">
            <span className="font-bold">Amount payable</span>
            <span className="font-black text-xl inline-flex items-center">
              <IndianRupee size={18} />
              {outstanding.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {outstanding > 0 ? (
          <>
            <div className="mt-5">
              <p className="text-sm font-black">Payment method</p>
              <div className="grid md:grid-cols-3 gap-3 mt-3">
                <Method
                  active={method === 'gpay'}
                  label="GPay"
                  onClick={() => setMethod('gpay')}
                />
                <Method
                  active={method === 'upi'}
                  label="Other UPI"
                  onClick={() => setMethod('upi')}
                />
                <Method
                  active={method === 'bank_transfer'}
                  label="Bank Transfer"
                  onClick={() => setMethod('bank_transfer')}
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="text-sm font-black block">
                UTR / Transaction Reference
              </label>
              <input
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                className="w-full rounded-xl border px-3 py-3 mt-2"
                placeholder="Enter transaction reference"
                autoComplete="off"
              />
            </div>

            <button
              type="button"
              onClick={submit}
              className="mt-5 rounded-xl bg-indigo-600 text-white px-5 py-3 font-black inline-flex items-center gap-2"
            >
              <Upload size={16} /> Submit Payment Reference
            </button>
          </>
        ) : (
          <div className="mt-5 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex gap-3">
            <CheckCircle2 className="text-emerald-600 shrink-0" />
            <div>
              <p className="font-black text-emerald-950">Fee fully verified</p>
              <p className="text-sm text-emerald-900 mt-1">
                No outstanding balance is shown from the verified payment data supplied to this component.
              </p>
            </div>
          </div>
        )}

        {payment && (
          <div className="mt-5 rounded-2xl bg-indigo-50 p-4">
            <p className="text-xs font-black uppercase text-indigo-700">
              Submission received
            </p>
            <p className="font-black mt-1">{payment.id}</p>
            <p className="text-sm text-indigo-900 mt-1">
              Status: {payment.status} · UTR: {payment.utr}
            </p>
          </div>
        )}

        {message && (
          <p className="mt-4 text-sm font-bold text-indigo-800">{message}</p>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5">
        <div className="flex gap-3">
          <ShieldCheck className="text-amber-600 shrink-0" />
          <div>
            <p className="font-black text-amber-950">
              Payment verification rule
            </p>
            <p className="text-sm text-amber-900 mt-1">
              Submitting a UTR does not mean payment is verified. An authorized
              admin must verify the transaction before enrollment, tutor approval
              or any paid feature is activated.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-5">
        <p className="font-black text-indigo-950">No payment gateway lock-in</p>
        <p className="text-sm text-indigo-900 mt-1">
          This phase intentionally uses a payment-reference workflow and does not
          add Razorpay or another gateway. The actual VATTAMS payment account/UPI
          details must be configured from the approved business settings, not hard-coded here.
        </p>
      </div>
    </section>
  );
}

function MoneyCard({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="bg-white border rounded-2xl p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-2xl font-black mt-1 inline-flex items-center">
        <IndianRupee size={19} />
        {amount.toLocaleString('en-IN')}
      </p>
    </div>
  );
}

function Method({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left font-black ${
        active
          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
          : 'bg-white'
      }`}
    >
      {label}
    </button>
  );
}
