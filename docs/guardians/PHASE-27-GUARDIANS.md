# VATTAMS Academy Phase 27 — Parent / Guardian Portal

## Purpose

Provides controlled visibility into a student's Academy activity without creating a second student account.

## Guardian access

Admin/Tutor can create a guardian profile and choose what can be shared:
- Progress
- Attendance
- Results
- Certificates
- All

## Security

- Guardian access code is hashed; plaintext is never stored.
- Guardian sessions are short-lived and stored as hashes.
- Guardian can only access explicitly shared students.
- Each guardian view is recorded in an activity log.
- Revocation is supported.
- No direct public database policies are opened.

## Important

This phase is an access/visibility layer. It does not replace the Student, Tutor or Admin roles.
Existing student and tutor data is preserved.
