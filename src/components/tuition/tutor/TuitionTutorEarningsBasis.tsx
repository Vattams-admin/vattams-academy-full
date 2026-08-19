import { useEffect, useState } from 'react';
import { Clock3, IndianRupee, Info } from 'lucide-react';
import { listTutorPayoutRules } from '@/lib/tuitionFeeStructure';

export default function TuitionTutorEarningsBasis() {
  const [rules, setRules] = useState<any[]>([]);

  useEffect(() => {
    listTutorPayoutRules()
      .then((result) => setRules(result.rules || []))
      .catch(() => setRules([]));
  }, []);

  return (
    <section className="bg-white border rounded-3xl p-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
          <Clock3 size={19} />
        </div>
        <div>
          <p className="text-xs font-black uppercase text-emerald-700">
            Tutor Earnings
          </p>
          <h2 className="text-xl font-black">Hourly Teaching Payout</h2>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
        <div className="flex gap-2">
          <Info size={17} className="shrink-0 mt-0.5" />
          <p>
            VATTAMS pays approved tutors on a completed teaching-hour basis.
            The displayed amount is for 60 minutes and is prorated for approved
            shorter sessions. This is a teaching payout, not a guaranteed
            monthly salary.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 mt-5">
        {rules.map((rule) => (
          <div key={rule.id} className="border rounded-2xl p-4">
            <p className="text-sm font-black">{rule.name}</p>
            {rule.payout_model === 'fixed_session' ? (
              <>
                <p className="text-3xl font-black mt-2">
                  ₹{Number(rule.fixed_session_amount || 0).toFixed(0)}
                </p>
                <p className="text-xs text-slate-500 mt-1">per 60 minutes</p>
                {rule.min_session_amount !== rule.max_session_amount && (
                  <p className="text-xs text-slate-500 mt-2">
                    Specialist range ₹{rule.min_session_amount}–₹{rule.max_session_amount}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-3xl font-black mt-2">
                  {rule.tutor_percentage}%
                </p>
                <p className="text-xs text-slate-500 mt-1">revenue share</p>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
