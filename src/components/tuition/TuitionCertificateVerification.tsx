import { FormEvent, useState } from 'react';
import { BadgeCheck, QrCode, Search, ShieldCheck, XCircle } from 'lucide-react';
import { verifyCertificate } from '@/lib/tuitionCertificateVerification';

export default function TuitionCertificateVerification() {
  const [certificateNumber, setCertificateNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [result, setResult] = useState<any>(null);
  const [message, setMessage] = useState('');

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    setMessage('');
    setResult(null);

    if (!certificateNumber.trim()) {
      setMessage('Enter a certificate number.');
      return;
    }

    try {
      const data = await verifyCertificate(
        certificateNumber.trim(),
        verificationCode.trim() || undefined,
      );
      setResult(data);
    } catch (error: any) {
      setMessage(error.message || 'Unable to verify certificate.');
    }
  };

  return (
    <section className="min-h-[70vh] bg-slate-50 p-5">
      <div className="max-w-xl mx-auto">
        <div className="bg-white border rounded-3xl p-6 shadow-sm">
          <div className="text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <QrCode className="text-indigo-600" />
            </div>
            <p className="text-xs font-black uppercase text-indigo-600 mt-4">
              VATTAMS Academy
            </p>
            <h1 className="text-2xl font-black mt-1">
              Certificate Verification
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Verify an Academy certificate using its unique certificate number.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-3 mt-6">
            <input
              value={certificateNumber}
              onChange={(e) => setCertificateNumber(e.target.value)}
              placeholder="Certificate Number"
              className="w-full rounded-xl border p-3 font-bold"
            />

            <input
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
              placeholder="Verification Code (optional)"
              className="w-full rounded-xl border p-3 font-bold tracking-widest"
            />

            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-white font-black inline-flex items-center justify-center gap-2"
            >
              <Search size={17} />
              Verify Certificate
            </button>
          </form>

          {message && (
            <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {message}
            </p>
          )}

          {result && (
            <div className={`mt-5 rounded-2xl border p-5 ${
              result.valid
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-3">
                {result.valid
                  ? <BadgeCheck className="text-emerald-600" />
                  : <XCircle className="text-red-600" />}
                <div>
                  <p className="font-black">
                    {result.valid ? 'Certificate Verified' : 'Certificate Not Valid'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {result.certificateNumber}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5 text-sm">
                <Info label="Recipient" value={result.recipientName} />
                <Info label="Course" value={result.courseName} />
                <Info label="Category" value={result.category} />
                <Info label="Type" value={result.certificateType} />
                <Info label="Percentage" value={result.percentage != null ? `${result.percentage}%` : '—'} />
                <Info label="Grade" value={result.grade || '—'} />
                <Info label="Issued" value={result.issuedAt ? new Date(result.issuedAt).toLocaleDateString() : '—'} />
                <Info label="Status" value={result.status} />
              </div>

              {result.revokedReason && (
                <p className="mt-4 text-sm text-red-700">
                  Revocation reason: {result.revokedReason}
                </p>
              )}

              <div className="mt-5 flex gap-2 text-xs text-slate-500 items-center">
                <ShieldCheck size={15} />
                Verification is provided by VATTAMS Academy.
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="rounded-xl bg-white/70 border p-3">
      <p className="text-[10px] font-black uppercase text-slate-500">{label}</p>
      <p className="font-bold mt-1 break-words">{String(value ?? '—')}</p>
    </div>
  );
}
