# VATTAMS Academy Phase 65 — Certificates + QR Verification

## Purpose
Create a certificate issuance and public verification foundation.

## Certificate lifecycle
Draft → Issued → Revoked

## Certificate data
- Certificate number
- Student
- Course
- Completion date
- Issue date
- Status
- Verification token
- Canonical verification URL

## QR
The QR code should encode only the canonical public verification URL.

## Security
1. Certificate issuance must be admin/server authorized.
2. Verification status must come from the server.
3. Revoked certificates must fail verification.
4. Certificate numbers must be unique.
5. Verification should not expose unnecessary personal data.
6. Private student/payment/authentication data must never be embedded in QR payloads.
7. Certificate changes should be auditable.

## Production note
The UI includes a QR-ready placeholder. The final QR image should be generated from the production canonical verification URL and not from client-controlled private data.

## Data safety
No destructive database changes.
Existing student, tutor, payment, tuition and historical records remain untouched.
