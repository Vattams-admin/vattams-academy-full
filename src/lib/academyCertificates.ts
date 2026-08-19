export type CertificateStatus = 'draft' | 'issued' | 'revoked';

export type AcademyCertificate = {
  id: string;
  certificateNumber: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  issueDate: string;
  completionDate: string;
  status: CertificateStatus;
  verificationToken: string;
  verificationUrl: string;
};

export function createVerificationToken(
  certificateNumber: string,
  studentId: string,
) {
  const raw = `${certificateNumber}:${studentId}`;
  let hash = 2166136261;
  for (let i = 0; i < raw.length; i += 1) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0).toString(36);
}

export function buildVerificationUrl(
  baseUrl: string,
  certificateNumber: string,
) {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  return `${cleanBase}/verify-certificate/${encodeURIComponent(certificateNumber)}`;
}

export function isCertificateVerifiable(certificate: AcademyCertificate) {
  return certificate.status === 'issued' && Boolean(certificate.verificationToken);
}

export function verifyCertificate(
  certificate: AcademyCertificate | undefined,
  certificateNumber: string,
) {
  if (!certificate) return false;
  return (
    certificate.certificateNumber.trim().toLowerCase() ===
      certificateNumber.trim().toLowerCase() &&
    isCertificateVerifiable(certificate)
  );
}
