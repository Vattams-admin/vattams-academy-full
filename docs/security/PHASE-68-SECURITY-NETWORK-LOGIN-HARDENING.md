# VATTAMS Academy Phase 68 — Final Security, Network Login & Production Hardening

## Primary requirement
All login flows should remain reliable across:
- Wi-Fi
- Mobile data / 4G / 5G
- Network switching
- Temporary network interruptions

## Added
- Login identifier validation
- Password input validation
- Safe return-path handling
- Network online/offline detection
- Unstable network classification
- Transient request retry policy
- Exponential backoff helper
- Production security checklist
- Idempotency guidance for payment/submission actions

## Authentication rules
1. Existing Supabase/authentication flow remains the source of truth.
2. Never use client-side role checks as authorization.
3. Never expose Supabase service-role credentials in frontend code.
4. Keep HTTPS enabled in production.
5. Preserve authentication session during normal network changes.
6. Handle temporary connectivity failures separately from invalid credentials.
7. Do not retry credential submissions indefinitely.
8. Do not log passwords, OTPs, session tokens or private payment information.
9. Use safe same-origin/allowlisted redirect paths.
10. Test every role on both Wi-Fi and mobile data.

## Retry rules
Only transient failures should be retried:
- 408
- 425
- 429
- 5xx
- network errors

Do not automatically retry irreversible actions without idempotency.

## Payment/submission safety
Payment, grading, assignment submission and other write operations should use server-side authorization and idempotency where duplicate requests could create duplicate records.

## RLS
Existing RLS should remain enabled. Do not broadly disable or replace existing policies to make login work.

## Data safety
No destructive database changes were made in Phase 68.
No existing users, students, tutors, payment records, historical selections or authentication records were deleted or recreated.
