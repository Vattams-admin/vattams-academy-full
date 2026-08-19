# VATTAMS Academy Phase 28 — Certificate Verification + QR Foundation

## Public verification

A public verification endpoint can verify an Academy certificate by certificate number and optional verification code.

The public response exposes only certificate presentation information needed for verification.

## Admin

Admin can:
- Create a verification record for an existing certificate
- Receive a unique verification code once
- Copy the verification code for certificate generation
- Revoke a verification record with a reason

## QR

The verification record provides the stable information needed to generate a QR that points to the Academy's certificate verification page.

The QR image generation itself should be attached to the final certificate renderer, without changing existing certificate records.

## Important

VATTAMS Academy should describe these as Academy-issued certificates.

Do not claim government, university, ISO, or other external accreditation unless it is actually obtained.
