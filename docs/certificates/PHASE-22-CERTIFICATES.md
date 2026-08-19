# VATTAMS Academy Phase 22 — Professional Certificates

## Certificate types

- Course certificate
- Competition certificate
- Achievement certificate (data model ready)

## Certificate identity

Every issued certificate gets:
- Unique VATTAMS certificate number
- Unique verification code
- Recipient name
- Certificate title
- Course/category
- Score/percentage/grade when applicable
- Issue date
- Issued status

## Verification

The public verification endpoint accepts the verification code and returns only public certificate information.

A verification URL is:

`https://vattams.net/verify-certificate/<VERIFICATION_CODE>`

The UI can render this URL as a QR code using the QR library already approved for the project, without exposing private database data.

## Revocation

Admin can revoke a certificate with a reason. A revoked certificate remains in the database for audit history and verifies as invalid.

## Accreditation

These certificates are VATTAMS Academy platform certificates. The application must not claim government, university, board, ISO, or other external accreditation unless such accreditation is separately and officially obtained.

## Data safety

This phase is additive and does not delete or rewrite historical Tuition data.
