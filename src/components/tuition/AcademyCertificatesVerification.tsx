import { useMemo, useState } from 'react';
import {
  Award,
  CheckCircle2,
  Copy,
  Download,
  QrCode,
  Search,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import {
  buildVerificationUrl,
  createVerificationToken,
  verifyCertificate,
  type AcademyCertificate,
} from '@/lib/academyCertificates';

const BASE_URL = 'https://vattams.net';

const DEMO_CERTIFICATE: AcademyCertificate = {
  id: 'certificate-1',
  certificateNumber: 'VATTAMS-2026-0001',
  studentId: 'student-demo',
  studentName: 'VATTAMS Student',
  courseId: 'mathematics',
  courseName: 'Mathematics',
  issueDate: '2026-08-18',
  completionDate: '2026-08-17',
  status: 'issued',
  verificationToken: '',
  verificationUrl: '',
};

const DEMO_CERTIFICATES: AcademyCertificate[] = [
  {
    ...DEMO_CERTIFICATE,
    verificationToken: createVerificationToken(
      DEMO_CERTIFICATE.certificateNumber,
      DEMO_CERTIFICATE.studentId,
    ),
    verificationUrl: buildVerificationUrl(
      BASE_URL,
      DEMO_CERTIFICATE.certificateNumber,
    ),
  },
];

export default function AcademyCertificatesVerification({
  certificates = DEMO_CERTIFICATES,
}: {
  certificates?: AcademyCertificate[];
}) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<AcademyCertificate | null>(null);
  const [message, setMessage] = useState('');

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return certificates;
    return certificates.filter((certificate) =>
      [
        certificate.certificateNumber,
        certificate.studentName,
        certificate.courseName,
      ]
        .join(' ')
        .toLowerCase()
        .includes(value),
    );
  }, [certificates, query]);

  const verify = () => {
    const found = certificates.find(
      (certificate) =>
        certificate.certificateNumber.trim().toLowerCase() ===
        query.trim().toLowerCase(),
    );

    if (verifyCertificate(found, query)) {
      setSelected(found || null);
      setMessage('Certificate verified successfully.');
    } else {
      setSelected(null);
      setMessage('Certificate could not be verified.');
    }
  };

  const copyVerificationUrl = async () => {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(selected.verificationUrl);
      setMessage('Verification link copied.');
    } catch {
      setMessage('Copy is not available in this browser.');
    }
  };

  return (
    <section className="space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-indigo-50 text-indigo-600 p-3">
              <Award size={22} />
            </div>
            <div>
              <p className="text-xs font-black uppercase text-indigo-600">
                VATTAMS Academy
              </p>
              <h2 className="text-2xl font-black mt-1">
                Certificates & QR Verification
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Issue completion certificates with a public verification route
                and QR-ready verification URL.
              </p>
            </div>
          </div>

          <span className="rounded-xl bg-emerald-50 text-emerald-700 px-4 py-2 text-sm font-black">
            QR Ready
          </span>
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-3.5 text-slate-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border pl-10 pr-3 py-3"
              placeholder="Enter certificate number..."
            />
          </div>

          <button
            type="button"
            onClick={verify}
            className="rounded-xl bg-indigo-600 text-white px-5 py-3 font-black"
          >
            Verify
          </button>
        </div>

        {message && (
          <div
            className={`mt-4 rounded-2xl p-4 flex gap-3 ${
              selected
                ? 'bg-emerald-50 text-emerald-900'
                : 'bg-red-50 text-red-900'
            }`}
          >
            {selected ? (
              <CheckCircle2 className="text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="text-red-600 shrink-0" />
            )}
            <p className="font-bold">{message}</p>
          </div>
        )}
      </div>

      {selected && (
        <div className="bg-white border rounded-3xl p-5">
          <div className="grid lg:grid-cols-[1fr_auto] gap-5 items-center">
            <div>
              <p className="text-xs font-black uppercase text-indigo-600">
                Verified Certificate
              </p>
              <h3 className="text-2xl font-black mt-2">
                {selected.studentName}
              </h3>
              <p className="text-slate-600 mt-1">{selected.courseName}</p>

              <div className="grid sm:grid-cols-2 gap-3 mt-5">
                <Info label="Certificate No." value={selected.certificateNumber} />
                <Info label="Issue Date" value={selected.issueDate} />
                <Info label="Completion Date" value={selected.completionDate} />
                <Info label="Status" value={selected.status.toUpperCase()} />
              </div>

              <div className="flex flex-wrap gap-2 mt-5">
                <button
                  type="button"
                  onClick={copyVerificationUrl}
                  className="rounded-xl border px-4 py-3 font-black inline-flex items-center gap-2"
                >
                  <Copy size={16} /> Copy Verification Link
                </button>
                <a
                  href={selected.verificationUrl}
                  className="rounded-xl bg-indigo-600 text-white px-4 py-3 font-black inline-flex items-center gap-2"
                >
                  <QrCode size={16} /> Open Verification
                </a>
                <button
                  type="button"
                  className="rounded-xl border px-4 py-3 font-black inline-flex items-center gap-2"
                  onClick={() =>
                    setMessage(
                      'Certificate download is reserved for the production certificate renderer.',
                    )
                  }
                >
                  <Download size={16} /> Download Certificate
                </button>
              </div>
            </div>

            <div className="w-44 h-44 rounded-3xl bg-slate-50 border flex flex-col items-center justify-center">
              <QrCode size={72} className="text-slate-700" />
              <p className="text-[10px] text-slate-500 font-bold mt-2 text-center px-3">
                QR should encode the verified public URL
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center gap-2">
          <Award size={19} className="text-indigo-600" />
          <h3 className="font-black">Issued Certificates</h3>
        </div>

        <div className="space-y-2 mt-4">
          {filtered.map((certificate) => (
            <button
              type="button"
              key={certificate.id}
              onClick={() => {
                setSelected(certificate);
                setMessage('');
              }}
              className="w-full rounded-2xl bg-slate-50 p-4 text-left flex flex-wrap justify-between gap-3"
            >
              <div>
                <p className="font-black">{certificate.certificateNumber}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {certificate.studentName} · {certificate.courseName}
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-black">
                {certificate.status}
              </span>
            </button>
          ))}

          {filtered.length === 0 && (
            <p className="text-sm text-slate-500">
              No certificate matches the search.
            </p>
          )}
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
              The public verification page should expose only the minimum
              certificate information required to confirm authenticity.
              Certificate status, number and verification token must be
              server-authorized.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5">
        <p className="font-black text-amber-950">Production QR rule</p>
        <p className="text-sm text-amber-900 mt-1">
          Generate the final QR image from the canonical production verification
          URL. Do not put private student information, payment data or editable
          credentials inside the QR payload.
        </p>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-black mt-1 break-words">{value}</p>
    </div>
  );
}
