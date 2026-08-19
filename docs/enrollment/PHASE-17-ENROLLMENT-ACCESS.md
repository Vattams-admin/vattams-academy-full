# VATTAMS Academy Phase 17 — Enrollment & Course Access

## Core rule

**Payment verified → enrollment active → course access available.**

A pending/submitted/rejected payment must not grant protected course access.

## Flow

1. Student chooses course.
2. Student creates payment record with the exact course ID.
3. Student completes payment.
4. Student submits UTR/proof where manual UPI is used.
5. Admin verifies payment.
6. Enrollment is created/activated.
7. Student can access the protected course.
8. Student proceeds to lessons, materials, classroom, attendance and assessments according to existing course rules.

## Security

- Student can only create/read their own enrollment.
- Admin can manage enrollment state.
- Course access is checked server-side through the enrollment service.
- Service-role credentials are server-side only.
- Existing RLS is not weakened.
- Existing Tuition data is not deleted.

## Important integration requirement

The existing Phase 15 Admin payment verification flow must call the enrollment activation operation after a payment becomes `verified`.

Until that integration is wired into the existing Admin payment verification handler, the new enrollment service can still be used manually, but the final launch test must confirm the automatic chain.

## Existing data

Historical `tuition_students`, `tuition_tutors`, courses and historical records remain intact.
