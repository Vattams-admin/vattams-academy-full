# VATTAMS Academy Phase 63 — Student/Tutor Profile & Account Management

## Purpose
Provide a safe profile management experience for students and tutors.

## Editable profile fields
- Display name
- Phone
- City
- Bio
- Profile photo URL/foundation

## Protected fields
The profile UI must not allow users to change:
- Account role
- Email identity without the existing verified account-change flow
- Approval status
- Student/Tutor IDs
- Employee IDs
- Payment verification status
- Tutor approval/fee authorization
- Security/RLS fields

## Security
1. A user can edit only their own profile.
2. Admin can edit according to the existing admin authorization policy.
3. Server-side authorization is mandatory.
4. RLS must prevent cross-user profile modification.
5. Authentication credentials remain under the existing auth system.
6. Profile photo storage must use authenticated storage rules in production.

## Data safety
No existing profile/student/tutor records were deleted or recreated.
No role or approval logic was changed.
