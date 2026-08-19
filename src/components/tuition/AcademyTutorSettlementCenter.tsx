import { useMemo, useState } from 'react';
import {
  Banknote,
  CheckCircle2,
  Clock3,
  IndianRupee,
  ShieldCheck,
  WalletCards,
} from 'lucide-react';
import {
  calculateApprovedHours,
  calculateTutorSettlement,
  type TutorRate,
  type TutorSettlement,
  type TutorTeachingSession,
} from '@/lib/academyTutorSettlement';

const DEMO_RATE: TutorRate = {
  tutorId: 'tutor-demo',
  rateType: 'hourly',
  hourlyRate: 400,
  currency: 'INR',
  effectiveFrom: '2026-08-01',
  active: true,
};

const DEMO_SESSIONS: TutorTeachingSession[] = [
  {
    id: 'session-1',
    tutorId: 'tutor-demo',
    studentId: 'student-1',
    courseId: 'mathematics',
    sessionDate: '2026-08-15',
    durationMinutes: 60,
    status: 'completed',
    approved: true,
  },
  {
    id: 'session-2',
    tutorId: 'tutor-demo',
    studentId: 'student-2',
    courseId: 'mathematics',
    sessionDate: '2026-08-16',
    durationMinutes: 90,
    status: 'completed',
    approved: true,
  },
  {
    id: 'session-3',
    tutorId: 'tutor-demo',
    studentId: 'student-3',
    courseId: 'science',
    sessionDate: '2026-08-17',
    durationMinutes: 60,
    status: 'pending_review',
    approved: false,
  },
];

export default function AcademyTutorSettlementCenter({
  rate = DEMO_RATE,
  sessions = DEMO_SESSIONS,
}: {
  rate?: TutorRate;
  sessions?: TutorTeachingSession[];
}) {
  const [settlement, setSettlement] = useState<TutorSettlement | null>(null);
  const [message, setMessage] = useState('');

  const approved = useMemo(
    () => calculateApprovedHours(sessions),
    [sessions],
  );

  const generateSettlement = () => {
    try {
      const result = calculateTutorSettlement(
        sessions,
        rate.hourlyRate,
        0,
      );
      setSettlement(result);
      setMessage(
        'Settlement draft calculated from approved completed teaching sessions.',
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to calculate settlement.',
      );
    }
  };

  return (
    <section className="space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-indigo-50 text-indigo-600 p-3">
              <WalletCards size={22} />
            </div>
            <div>
              <p className="text-xs font-black uppercase text-indigo-600">
                Tutor Finance
              </p>
              <h2 className="text-2xl font-black mt-1">
                Hourly Fee & Settlement
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Calculate tutor earnings from approved completed teaching hours.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-indigo-50 text-indigo-700 px-4 py-2 text-sm font-black">
            Hourly Basis
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-3">
        <Card label="Hourly Rate" value={`₹${rate.hourlyRate.toLocaleString('en-IN')}`} />
        <Card label="Approved Minutes" value={approved.approvedMinutes.toString()} />
        <Card label="Approved Hours" value={approved.approvedHours.toFixed(2)} />
        <Card
          label="Estimated Gross"
          value={`₹${(approved.approvedHours * rate.hourlyRate).toLocaleString('en-IN')}`}
        />
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center gap-2">
          <Clock3 size={19} className="text-indigo-600" />
          <h3 className="font-black">Teaching Sessions</h3>
        </div>

        <div className="space-y-3 mt-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="rounded-2xl bg-slate-50 p-4 flex flex-wrap justify-between gap-3"
            >
              <div>
                <p className="font-black text-sm">
                  {session.courseId}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {session.sessionDate} · {session.durationMinutes} minutes
                </p>
              </div>

              <span
                className={`self-start rounded-full px-3 py-1 text-xs font-black ${
                  session.approved
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {session.approved ? 'Approved' : 'Pending Review'}
              </span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={generateSettlement}
          className="mt-5 rounded-xl bg-indigo-600 text-white px-5 py-3 font-black inline-flex items-center gap-2"
        >
          <Banknote size={16} /> Calculate Settlement
        </button>

        {settlement && (
          <div className="mt-5 rounded-3xl bg-indigo-50 border border-indigo-100 p-5">
            <p className="text-xs font-black uppercase text-indigo-700">
              Settlement Draft
            </p>

            <div className="grid md:grid-cols-3 gap-3 mt-4">
              <Card
                label="Hours"
                value={settlement.approvedHours.toFixed(2)}
              />
              <Card
                label="Gross"
                value={`₹${settlement.grossAmount.toLocaleString('en-IN', {
                  maximumFractionDigits: 2,
                })}`}
              />
              <Card
                label="Net"
                value={`₹${settlement.netAmount.toLocaleString('en-IN', {
                  maximumFractionDigits: 2,
                })}`}
              />
            </div>

            <div className="mt-4 rounded-2xl bg-white p-4">
              <p className="text-sm font-black">
                Status: {settlement.status}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Final approval and payment must be completed by the authorized
                VATTAMS admin/payroll workflow.
              </p>
            </div>
          </div>
        )}

        {message && (
          <p className="text-sm font-bold text-indigo-800 mt-4">
            {message}
          </p>
        )}
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5">
        <div className="flex gap-3">
          <CheckCircle2 className="text-emerald-600 shrink-0" />
          <div>
            <p className="font-black text-emerald-950">
              Hourly tutor fee model
            </p>
            <p className="text-sm text-emerald-900 mt-1">
              Tutor earnings are based on approved completed teaching minutes,
              converted to hours and multiplied by the approved hourly rate.
              Cancelled or unapproved sessions are not included.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5">
        <div className="flex gap-3">
          <ShieldCheck className="text-amber-600 shrink-0" />
          <div>
            <p className="font-black text-amber-950">
              Settlement security
            </p>
            <p className="text-sm text-amber-900 mt-1">
              Hourly rates, approved sessions, deductions and paid status must
              be server-controlled. Tutors must not be able to edit their own
              rate or approve their own sessions.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-5">
        <p className="font-black text-indigo-950">Important preservation rule</p>
        <p className="text-sm text-indigo-900 mt-1">
          This phase does not replace the existing tutor fee/approval logic.
          Existing tutor records and historical selections remain preserved.
          The hourly settlement model becomes the calculation foundation only
          after the existing production rules are verified.
        </p>
      </div>
    </section>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border rounded-2xl p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-xl font-black mt-1 inline-flex items-center gap-1">
        {value.startsWith('₹') && <IndianRupee size={16} />}
        {value.startsWith('₹') ? value.slice(1) : value}
      </p>
    </div>
  );
}
