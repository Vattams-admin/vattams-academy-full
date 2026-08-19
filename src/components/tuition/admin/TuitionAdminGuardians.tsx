import { useState } from 'react';
import { KeyRound, UserPlus } from 'lucide-react';
import { createGuardian, grantGuardianShare, revokeGuardianShare } from '@/lib/tuitionGuardians';

export default function TuitionAdminGuardians() {
  const [form, setForm] = useState({
    studentId: '',
    guardianName: '',
    relationship: 'Parent',
    email: '',
    mobile: '',
  });
  const [shareTypes, setShareTypes] = useState<string[]>(['all']);
  const [created, setCreated] = useState<any>(null);
  const [message, setMessage] = useState('');

  const create = async () => {
    try {
      const result = await createGuardian({ ...form, shareTypes });
      setCreated(result);
      setMessage('Guardian access created. Save the initial access code securely.');
    } catch (error: any) {
      setMessage(error.message || 'Unable to create guardian access.');
    }
  };

  const addShare = async () => {
    if (!created?.guardian?.id) return;
    try {
      await grantGuardianShare({
        guardianId: created.guardian.id,
        studentId: form.studentId,
        shareType: 'all',
      });
      setMessage('Guardian share updated.');
    } catch (error: any) {
      setMessage(error.message || 'Unable to update sharing.');
    }
  };

  const revoke = async (shareId: string) => {
    try {
      await revokeGuardianShare(shareId);
      setMessage('Guardian sharing revoked.');
    } catch (error: any) {
      setMessage(error.message || 'Unable to revoke sharing.');
    }
  };

  return (
    <section className="space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center gap-3">
          <UserPlus className="text-indigo-600" />
          <div>
            <p className="text-xs font-black uppercase text-indigo-600">Academy Admin</p>
            <h2 className="text-xl font-black">Parent / Guardian Access</h2>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3 mt-5">
          <input
            value={form.studentId}
            onChange={(e) => setForm({ ...form, studentId: e.target.value })}
            placeholder="Student ID"
            className="rounded-xl border p-3"
          />
          <input
            value={form.guardianName}
            onChange={(e) => setForm({ ...form, guardianName: e.target.value })}
            placeholder="Guardian name"
            className="rounded-xl border p-3"
          />
          <input
            value={form.relationship}
            onChange={(e) => setForm({ ...form, relationship: e.target.value })}
            placeholder="Relationship"
            className="rounded-xl border p-3"
          />
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email (optional)"
            className="rounded-xl border p-3"
          />
          <input
            value={form.mobile}
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
            placeholder="Mobile (optional)"
            className="rounded-xl border p-3"
          />
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {['all', 'progress', 'attendance', 'results', 'certificates'].map((type) => (
            <button
              type="button"
              key={type}
              onClick={() =>
                setShareTypes((current) =>
                  current.includes(type)
                    ? current.filter((x) => x !== type)
                    : [...current.filter((x) => x !== 'all'), type],
                )
              }
              className={`rounded-xl border px-3 py-2 text-xs font-black ${
                shareTypes.includes(type) ? 'bg-indigo-600 text-white' : ''
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={create}
          className="mt-4 rounded-xl bg-indigo-600 px-5 py-3 text-white font-black"
        >
          Create Guardian Access
        </button>

        {message && (
          <p className="mt-4 rounded-xl bg-indigo-50 p-3 text-sm text-indigo-800">
            {message}
          </p>
        )}
      </div>

      {created && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5">
          <div className="flex gap-2 items-center font-black text-amber-900">
            <KeyRound size={18} />
            Initial Access Code
          </div>
          <p className="mt-3 text-2xl font-black tracking-widest break-all">
            {created.initialAccessCode}
          </p>
          <p className="text-xs text-amber-800 mt-2">
            This code is returned only at creation time and is not stored in plaintext.
          </p>

          <button
            type="button"
            onClick={addShare}
            className="mt-4 rounded-xl border px-4 py-2 text-sm font-black"
          >
            Ensure All-Access Share
          </button>
        </div>
      )}
    </section>
  );
}
