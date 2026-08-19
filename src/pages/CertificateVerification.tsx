import { useEffect, useState } from 'react';
import { Award, CheckCircle2, ShieldX, Search } from 'lucide-react';
import { verifyCertificate } from '@/lib/tuitionCertificates';

export default function CertificateVerification() {
  const [number, setNumber] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get('number');
    if (value) {
      setNumber(value);
      verify(value)
    }
  }, []);

  async function verify(value = number) {
    if (!value.trim()) return;

    setLoading(true);
    try {
      setResult(await verifyCertificate(value.trim()));
    } catch (e: any) {
      setResult({ valid: false, message: e.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Award size={30} />
          </div>
          <h1 className="text-2xl font-black mt-4">
            VATTAMS Academy
          </h1>
          <p className="text-slate-500 mt-1">
            Certificate Verification
          </p>
        </div>

        <div className="flex gap-2 mt-7">
          <input
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="Enter certificate number"
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200"
          />
          <button
            type="button"
            disabled={loading}
            onClick={() => verify()}
            className="px-4 py-3 rounded-xl bg-indigo-600 text-white font-bold"
          >
            <Search size={18} />
          </button>
        </div>

        {result && (
          <div className="mt-6">
            {result.valid ? (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5">
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 />
                  <span className="font-black">VALID CERTIFICATE</span>
                </div>

                <div className="mt-5 space-y-2 text-sm">
                  <p>
                    <strong>Certificate:</strong>{' '}
                    {result.certificate.certificate_number}
                  </p>
                  <p>
                    <strong>Student:</strong>{' '}
                    {result.certificate.student_name}
                  </p>
                  <p>
                    <strong>Course:</strong>{' '}
                    {result.certificate.course_name}
                  </p>
                  <p>
                    <strong>Issued:</strong>{' '}
                    {result.certificate.issued_on}
                  </p>
                  <p>
                    <strong>Completion:</strong>{' '}
                    {result.certificate.completion_percentage}%
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-red-50 border border-red-200 p-5">
                <div className="flex items-center gap-2 text-red-700">
                  <ShieldX />
                  <span className="font-black">CERTIFICATE NOT VALID</span>
                </div>
                <p className="text-sm text-red-700 mt-3">
                  {result.message || 'The certificate could not be verified.'}
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
