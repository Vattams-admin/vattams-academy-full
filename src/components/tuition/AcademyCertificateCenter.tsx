import { useMemo, useState } from 'react';
import {
  Award,
  CheckCircle2,
  Copy,
  ExternalLink,
  QrCode,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react';
import {
  buildVerificationUrl,
  createCertificateNumber,
  validateCertificateEligibility,
} from '@/lib/academyCertificates';

export default function AcademyCertificateCenter() {
  const [certificateNumber, setCertificateNumber] = useState(
    createCertificateNumber(),
  );
  const [copied, setCopied] = useState(false);

  const verificationUrl = useMemo(
    () => buildVerificationUrl(window.location.origin, certificateNumber),
    [certificateNumber],
  );

  const eligibility = validateCertificateEligibility({
    completionPercentage: 100,
    attendancePercentage: 92,
    minimumCompletionPercentage: 90,
    minimumAttendancePercentage: 75,
    passedFinalAssessment: true,
  });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-indigo-50 text-indigo-600 p-3">
            <Award size={22} />
          </div>
          <div>
            <p className="text-xs font-black uppercase text-indigo-600">
              Certificates
            </p>
            <h2 className="text-2xl font-black mt-1">
              VATTAMS Academy Certificate Center
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Professional certificate and QR verification foundation.
            </p>
          </div>
        </div>
      </div>

      <div className={`rounded-3xl border p-5 ${
        eligibility.eligible
          ? 'bg-emerald-50 border-emerald-200'
          : 'bg-amber-50 border-amber-200'
      }`}>
        <div className="flex gap-3">
          {eligibility.eligible
            ? <CheckCircle2 className="text-emerald-600 shrink-0" />
            : <TriangleAlert className="text-amber-600 shrink-0" />}
          <div>
            <p className="font-black">
              {eligibility.eligible
                ? 'Eligible for certificate review'
                : 'Certificate requirements incomplete'}
            </p>
            {eligibility.issues.length > 0 && (
              <ul className="text-sm mt-2 list-disc pl-5">
                {eligibility.issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-6">
        <div className="max-w-xl mx-auto text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Award size={32} />
          </div>

          <p className="text-xs font-black uppercase text-indigo-600 mt-5">
            VATTAMS Academy
          </p>
          <h3 className="text-3xl font-black mt-2">
            Certificate of Completion
          </h3>
          <p className="text-sm text-slate-500 mt-3">
            This certificate template is a product foundation. Final issuance
            must be server-authorized after verified completion.
          </p>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Certificate Number</p>
            <p className="font-black text-lg mt-1 break-all">
              {certificateNumber}
            </p>
          </div>

          <div className="mt-5 flex justify-center">
            <div
              className="w-32 h-32 rounded-2xl border-4 border-slate-900 flex items-center justify-center bg-white"
              aria-label="QR verification placeholder"
            >
              <QrCode size={72} />
            </div>
          </div>

          <p className="text-xs text-slate-500 mt-3 break-all">
            Verification: {verificationUrl}
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-5">
            <button
              type="button"
              onClick={copy}
              className="rounded-xl border px-4 py-3 font-black inline-flex items-center gap-2"
            >
              <Copy size={16} /> {copied ? 'Copied' : 'Copy Verification'}
            </button>

            <a
              href={verificationUrl}
              className="rounded-xl bg-indigo-600 text-white px-4 py-3 font-black inline-flex items-center gap-2"
            >
              <ExternalLink size={16} /> Open Verify
            </a>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-5">
        <div className="flex gap-3">
          <ShieldCheck className="text-indigo-600 shrink-0" />
          <div>
            <p className="font-black text-indigo-950">
              Verification security
            </p>
            <p className="text-sm text-indigo-900 mt-1">
              Certificate numbers must be generated and stored server-side in
              production. The verification page must query an authorized,
              read-only verification path and must not expose private student data.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
