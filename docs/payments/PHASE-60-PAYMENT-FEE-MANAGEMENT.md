# VATTAMS Academy Phase 60 — Payment & Fee Management

## Purpose
Create the payment/fee management foundation while preserving the existing VATTAMS Tuition payment and approval workflow.

## Payment methods
- GPay
- Other UPI
- Bank Transfer

This phase uses transaction-reference/UTR submission. No payment gateway was added.

## Payment lifecycle
Pending → Submitted → Under Review → Verified
                         ↘ Rejected
Verified payments may later be refunded through an authorized workflow.

## Added
- Fee model
- Payment model
- Outstanding balance calculation
- UTR validation
- Payment submission UI
- Payment status foundation
- Admin verification requirement

## Critical rule
Submitting a UTR does NOT equal payment verification.

Only an authorized admin/server workflow may mark a payment as verified.

## Production security
1. Never trust client-supplied payment status.
2. Verify transaction/reference data server-side.
3. Restrict payment records by authenticated student/tutor/admin role.
4. Do not expose private payment data to other students.
5. Preserve payment history and verification audit trail.
6. Do not hard-code business UPI/bank details in source code.
7. Existing payment/UTR and tutor approval logic remains the source of truth until explicitly migrated.

## Data safety
No destructive database changes were made.
No payment gateway was installed.
No existing payment records were deleted or altered.
