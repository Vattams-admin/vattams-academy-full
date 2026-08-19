import { useState } from 'react';
import { BadgeCheck, Copy, ShieldOff } from 'lucide-react';
import {
  createCertificateVerification,
  revokeCertificateVerification,
} from '@/lib/tuitionCertificateVerification';

export default function TuitionAdminCertificateVerification() {
  const [certificateId, setCertificateId] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [reason, setReason] = useState('');
  const [created, setCreated] = useState<any>(null);
  const [message, setMessage] = useState('');

  const create = async () => {
    try {
      const token = sessionStorage.getItem('vattams_admin_token') || '';
      const result = await createCertificateVerification(certificateId.trim(), token);
      setCreated(result.verification);
      setVerificationId(result.verification.id);
      setMessage('Verification record ready. Keep the verification code secure.');
    } catch (error: any) {
      setMessage(error.message || 'Unable to create verification.');
    }
  };

  const revoke = async () => {
    if (!verificationId) return;

    try {
      const token = sessionStorage.getItem('vattams_admin_token') || '';
      await revokeCertificateVerification(
        verificationId,
        reason.trim() || 'Revoked by Academy administration.',
        token,
      );
      setMessage('Certificate verification has been revoked.');
    } catch (error: any) {
      setMessage(error.message || 'Unable to revoke verification.');
    }
  };

  const copyCode = async () => {
    if (created?.verificationCode) {
      await navigator.clipboard.writeText(created.verificationCode);
      setMessage('Verification code copied.');
    }
  };

  return (
    <section className="space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center gap-3">
          <BadgeCheck className="text-indigo-600" />
          <div>
            <p className="text-xs font-black uppercase text-indigo-600">Academy Admin</p>
            <h2 className="text-xl font-black">Certificate Verification</h2>
          </div>
        </div>

        <input
          value={certificateId}
          onChange={(e) => setCertificateId(e.target.value)}
          placeholder="Certificate ID"
          className="w-full mt-5 rounded-xl border p-3"
        />

        <button
          type="button"
          onClick={create}
          className="mt-3 rounded-xl bg-indigo-600 px-5 py-3 text-white font-black"
        >
          Create Verification Record
        </button>

        {message && (
          <p className="mt-4 rounded-xl bg-indigo-50 p-3 text-sm text-indigo-800">
            {message}
          </p>
        )}
      </div>

      {created && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5">
          <p className="text-xs font-black uppercase text-emerald-700">
            Verification Ready
          </p>
          <p className="text-lg font-black mt-2">{created.certificateNumber}</p>

          <div className="flex gap-2 mt-3">
            <input
              readOnly
              value={created.verificationCode}
              className="flex-1 rounded-xl border p-3 font-black tracking-widest bg-white"
            />
            <button type="button" onClick={copyCode} className="rounded-xl border px-4 bg-white">
              <Copy size={17} />
            </button>
          </div>

          <p className="text-xs text-emerald-800 mt-3">
            Use this verification data when generating the certificate QR.
          </p>
        </div>
      )}

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center gap-2">
          <ShieldOff size={18} className="text-red-600" />
          <h3 className="font-black">Revoke Verification</h3>
        </div>

        <input
          value={verificationId}
          onChange={(e) => setVerificationId(e.target.value)}
          placeholder="Verification ID"
          className="w-full mt-4 rounded-xl border p-3"
        />
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason"
          className="w-full mt-3 rounded-xl border p-3"
        />

        <button
          type="button"
          onClick={revoke}
          className="mt-3 rounded-xl bg-red-600 px-5 py-3 text-white font-black"
        >
          Revoke Verification
        </button>
      </div>
    </section>
  );
}
