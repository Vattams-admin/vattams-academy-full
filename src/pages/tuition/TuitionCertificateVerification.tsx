import { useState } from 'react';
import { CheckCircle2, Search, ShieldAlert, ShieldCheck } from 'lucide-react';
import { verifyCertificate } from '@/lib/tuitionCertificates';

export default function TuitionCertificateVerification() {
  const [token, setToken] = useState('');
  const [result, setResult] = useState<any>(null);
  const [message, setMessage] = useState('');

  const verify = async () => {
    setMessage('');
    setResult(null);

    try {
      const data = await verifyCertificate(token.trim());
      setResult(data);
    } catch (error: any) {
      setMessage(error.message || 'Certificate could not be verified.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-5">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="bg-white border rounded-3xl p-6">
          <p className="text-xs font-black uppercase text-indigo-600">VATTAMS Academy</p>
          <h1 className="text-3xl font-black mt-1">Certificate Verification</h1>
          <p className="text-sm text-slate-500 mt-2">
            Verify an Academy certificate using its unique verification code.
          </p>

          <div className="flex gap-2 mt-6">
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter verification code"
              className="flex-1 rounded-xl border p-3"
            />
            <button
              type="button"
              onClick={verify}
              className="rounded-xl bg-indigo-600 text-white px-5 font-black inline-flex items-center gap-2"
            >
              <Search size={17} /> Verify
            </button>
          </div>

          {message && (
            <div className="mt-5 rounded-2xl bg-rose-50 border border-rose-200 p-4 flex gap-3 text-rose-800">
              <ShieldAlert className="shrink-0" />
              <p className="text-sm">{message}</p>
            </div>
          )}

          {result && (
            <div className={`mt-5 rounded-2xl border p-5 ${
              result.valid ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
            }`}>
              <div className="flex items-center gap-3">
                {result.valid
                  ? <CheckCircle2 className="text-emerald-600" />
                  : <ShieldAlert className="text-rose-600" />}
                <div>
                  <p className="font-black">{result.valid ? 'Certificate Verified' : 'Certificate Not Valid'}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {result.certificate?.status || 'Unknown status'}
                  </p>
                </div>
              </div>

              {result.certificate && (
                <div className="mt-5 space-y-3 text-sm">
                  <div><span className="text-slate-500">Certificate No:</span> <strong>{result.certificate.certificate_number}</strong></div>
                  <div><span className="text-slate-500">Title:</span> <strong>{result.certificate.title}</strong></div>
                  <div><span className="text-slate-500">Issuer:</span> <strong>{result.certificate.issuer_name}</strong></div>
                  <div><span className="text-slate-500">Issue Date:</span> <strong>{result.certificate.issue_date}</strong></div>
                  {result.certificate.grade && <div><span className="text-slate-500">Grade:</span> <strong>{result.certificate.grade}</strong></div>}
                  {result.certificate.percentage != null && <div><span className="text-slate-500">Score:</span> <strong>{result.certificate.percentage}%</strong></div>}
                </div>
              )}

              <div className="mt-5 rounded-xl bg-white/70 p-3 text-xs flex gap-2">
                <ShieldCheck size={15} className="shrink-0" />
                Verification only confirms the certificate record held by VATTAMS Academy. It does not imply external accreditation.
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
