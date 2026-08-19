import { useEffect, useState } from 'react';
import { Award, ExternalLink, QrCode, ShieldCheck } from 'lucide-react';
import { getMyCertificates } from '@/lib/tuitionCertificates';

export default function TuitionStudentCertificates() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getMyCertificates()
      .then((result) => setCertificates(result.certificates || []))
      .catch((error) => setMessage(error.message || 'Unable to load certificates.'));
  }, []);

  return (
    <section className="space-y-5">
      {message && (
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{message}</p>
      )}

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center gap-3">
          <Award className="text-amber-500" />
          <div>
            <p className="text-xs font-black uppercase text-amber-600">
              VATTAMS Academy
            </p>
            <h2 className="text-xl font-black">My Certificates</h2>
          </div>
        </div>

        <div className="space-y-4 mt-5">
          {certificates.map((certificate) => (
            <article key={certificate.id} className="rounded-2xl border p-5">
              <div className="flex gap-3">
                <ShieldCheck className="text-emerald-600 shrink-0" />
                <div className="flex-1">
                  <h3 className="font-black">{certificate.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {certificate.course_name || certificate.category || 'VATTAMS Academy'}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] text-slate-500 font-bold">Certificate No.</p>
                      <p className="text-sm font-black mt-1 break-all">
                        {certificate.certificate_number}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] text-slate-500 font-bold">Grade</p>
                      <p className="text-sm font-black mt-1">
                        {certificate.grade || '—'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold">
                      <QrCode size={15} />
                      {certificate.verification_code}
                    </span>

                    <a
                      href={`https://vattams.net/verify-certificate/${certificate.verification_code}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-black text-white"
                    >
                      Verify
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}

          {!certificates.length && (
            <p className="text-sm text-slate-400 text-center py-8">
              No certificates have been issued yet.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
