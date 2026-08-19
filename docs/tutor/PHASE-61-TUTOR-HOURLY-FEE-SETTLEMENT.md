# VATTAMS Academy Phase 61 — Tutor Hourly Fee & Settlement

## Purpose
Create the hourly tutor fee and settlement foundation requested for VATTAMS Academy.

## Calculation
Approved completed teaching minutes
→ minutes converted to hours
→ multiplied by approved tutor hourly rate
→ approved deductions (if any)
→ net settlement

## Included
- Hourly tutor rate model
- Teaching session model
- Approved-hour calculation
- Gross settlement
- Deductions foundation
- Net settlement
- Draft → Under Review → Approved → Paid lifecycle foundation
- Tutor settlement UI
- Security rules

## Critical security
1. Tutor cannot edit their own hourly rate.
2. Tutor cannot approve their own teaching sessions.
3. Only authorized admin/payroll can approve settlements.
4. Session duration/status must be server-validated.
5. Historical settlement records must remain auditable.
6. Paid settlements must not be silently edited.
7. RLS must restrict tutor visibility to their own settlement data.

## Existing logic preservation
The existing tutor fee/approval logic remains the source of truth until the production schema and workflow are explicitly verified. This phase does not delete, overwrite or migrate existing tutor records.
