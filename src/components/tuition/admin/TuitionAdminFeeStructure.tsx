import { useEffect, useState } from 'react';
import { BadgeIndianRupee, RefreshCw, Save } from 'lucide-react';
import {
  adminCreateFee,
  adminUpdateFee,
  adminUpdatePayoutRule,
  listFeeStructures,
  listTutorPayoutRules,
} from '@/lib/tuitionFeeStructure';

export default function TuitionAdminFeeStructure() {
  const [fees, setFees] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [newFee, setNewFee] = useState({
    name: '',
    category: 'Academic',
    level: '',
    studentFee: '',
  });

  const load = async () => {
    try {
      const [feeResult, payoutResult] = await Promise.all([
        listFeeStructures(),
        listTutorPayoutRules(),
      ]);
      setFees(feeResult.fees || []);
      setRules(payoutResult.rules || []);
    } catch (e: any) {
      setMessage(e.message || 'Unable to load fee structure.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createFee = async () => {
    if (!newFee.name.trim() || !newFee.studentFee) {
      setMessage('Fee name and student fee are required.');
      return;
    }

    await adminCreateFee({
      name: newFee.name,
      category: newFee.category,
      level: newFee.level || null,
      studentFee: Number(newFee.studentFee),
    });

    setNewFee({ name: '', category: 'Academic', level: '', studentFee: '' });
    setMessage('Fee structure added.');
    await load();
  };

  return (
    <section className="space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BadgeIndianRupee className="text-indigo-600" />
            <div>
              <p className="text-xs font-black uppercase text-indigo-600">
                Finance
              </p>
              <h2 className="text-xl font-black">Fee Structure</h2>
            </div>
          </div>

          <button
            type="button"
            onClick={load}
            className="p-2 rounded-xl border"
          >
            <RefreshCw size={17} />
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-2 mt-5">
          <input
            value={newFee.name}
            onChange={(e) => setNewFee({ ...newFee, name: e.target.value })}
            placeholder="Fee name"
            className="px-4 py-3 rounded-xl border"
          />
          <input
            value={newFee.category}
            onChange={(e) => setNewFee({ ...newFee, category: e.target.value })}
            placeholder="Category"
            className="px-4 py-3 rounded-xl border"
          />
          <input
            value={newFee.level}
            onChange={(e) => setNewFee({ ...newFee, level: e.target.value })}
            placeholder="Level"
            className="px-4 py-3 rounded-xl border"
          />
          <input
            value={newFee.studentFee}
            onChange={(e) => setNewFee({ ...newFee, studentFee: e.target.value })}
            placeholder="Student fee ₹"
            inputMode="decimal"
            className="px-4 py-3 rounded-xl border"
          />
        </div>

        <button
          type="button"
          onClick={createFee}
          className="mt-3 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white font-black"
        >
          <Save size={16} />
          Add Fee
        </button>

        {message && (
          <p className="mt-3 rounded-xl bg-indigo-50 text-indigo-800 p-3 text-sm font-semibold">
            {message}
          </p>
        )}
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <h2 className="font-black text-lg">Student Fee Catalogue</h2>

        <div className="space-y-2 mt-4">
          {fees.map((fee) => (
            <div
              key={fee.id}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border rounded-2xl p-4"
            >
              <div>
                <p className="font-black">{fee.name}</p>
                <p className="text-xs text-slate-500">
                  {fee.category} {fee.level ? `· ${fee.level}` : ''} ·{' '}
                  {fee.delivery_mode}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  defaultValue={fee.student_fee}
                  onBlur={async (e) => {
                    const value = Number(e.target.value);
                    if (!Number.isFinite(value) || value < 0) return;
                    await adminUpdateFee(fee.id, { student_fee: value });
                    setMessage(`${fee.name} updated.`);
                  }}
                  className="w-28 px-3 py-2 rounded-xl border font-bold"
                  inputMode="decimal"
                />
                <span className="font-black">INR</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <h2 className="font-black text-lg">Tutor Payout Rules</h2>
        <p className="text-sm text-slate-500 mt-1">
          Launch basis: fixed hourly tutor payout by teaching level.
        </p>

        <div className="space-y-2 mt-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center justify-between border rounded-2xl p-4"
            >
              <div>
                <p className="font-black">{rule.name}</p>
                <p className="text-xs text-slate-500">
                  {rule.tutor_tier}
                </p>
              </div>

              <input
                defaultValue={rule.tutor_percentage}
                onBlur={async (e) => {
                  const value = Number(e.target.value);
                  if (!Number.isFinite(value) || value < 0) return;
                  await adminUpdatePayoutRule(
                    rule.id,
                    rule.payout_model === 'fixed_session'
                      ? { fixed_session_amount: value }
                      : { tutor_percentage: value },
                  );
                  setMessage(`${rule.name} payout updated.`);
                }}
                className="w-24 px-3 py-2 rounded-xl border font-bold"
                inputMode="decimal"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
