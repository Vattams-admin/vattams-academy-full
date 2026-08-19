export function getCertificateVerificationUrl(verificationCode: string) {
  return `https://vattams.net/verify-certificate/${encodeURIComponent(
    verificationCode.trim().toUpperCase(),
  )}`;
}
