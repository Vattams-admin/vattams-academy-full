import { useEffect, useState } from 'react';
import { Award, ExternalLink, ShieldCheck } from 'lucide-react';
import { getStudentCertificates } from '@/lib/tuitionCertificates';

export default function TuitionStudentCertificates() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getStudentCertificates()
      .then((data) => setCertificates(data.certificates || []))
      .catch((error: any) => setMessage(error.message || 'Unable to load certificates.'));
  }, []);

  return (
    <section className="max-w-6xl mx-auto p-5 space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <p className="text-xs font-black uppercase text-indigo-600">VATTAMS Academy</p>
        <h1 className="text-2xl font-black mt-1">My Certificates</h1>
        <p className="text-sm text-slate-500 mt-1">
          View certificates issued by VATTAMS Academy and verify them using their QR verification link.
        </p>
        {message && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{message}</p>}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {certificates.map((certificate) => {
          const verificationUrl =
            `https://vattams.net/#/certificate/verify/${certificate.verification_token}`;

          return (
            <article key={certificate.certificate_number} className="bg-white border rounded-3xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                  <Award className="text-indigo-600" />
                </div>
                <span className={`text-[10px] font-black uppercase rounded-full px-3 py-1 ${
                  certificate.status === 'issued'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700'
                }`}>
                  {certificate.status}
                </span>
              </div>

              <h2 className="text-xl font-black mt-5">{certificate.title}</h2>
              <p className="text-sm text-slate-500 mt-2">{certificate.description || 'VATTAMS Academy Certificate'}</p>

              <div className="grid grid-cols-2 gap-3 mt-5 text-sm">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Certificate No.</p>
                  <p className="font-black mt-1">{certificate.certificate_number}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Issue Date</p>
                  <p className="font-black mt-1">{certificate.issue_date}</p>
                </div>
                {certificate.percentage != null && (
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Score</p>
                    <p className="font-black mt-1">{certificate.percentage}%</p>
                  </div>
                )}
                {certificate.grade && (
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Grade</p>
                    <p className="font-black mt-1">{certificate.grade}</p>
                  </div>
                )}
              </div>

              <a
                href={verificationUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 w-full rounded-xl bg-indigo-600 text-white px-4 py-3 font-black inline-flex justify-center items-center gap-2"
              >
                <ShieldCheck size={17} /> Verify Certificate <ExternalLink size={15} />
              </a>
            </article>
          );
        })}

        {!certificates.length && !message && (
          <div className="md:col-span-2 text-center py-14 text-sm text-slate-400">
            No certificates have been issued yet.
          </div>
        )}
      </div>
    </section>
  );
}
