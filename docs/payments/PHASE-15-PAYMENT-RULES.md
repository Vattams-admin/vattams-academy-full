# VATTAMS Academy Phase 15 — Payment Rules

## Scope

This phase adds a separate Academy student/course payment ledger.

### Preserved

The existing tutor registration fee + UTR + approval workflow is NOT replaced by this module.

## Supported payment categories

- Course fee
- Enrollment fee
- Trial fee
- Exam fee
- Competition fee
- Certificate fee
- Other

## Payment lifecycle

`pending → submitted → verified`

Alternative outcomes:

`submitted → rejected`

Refund/cancellation statuses are reserved for future finance workflows.

## UPI/manual payment

The module supports displaying Academy payment details and collecting a UTR/transaction reference for Admin verification.

Do not place a private bank password, PIN, OTP, card CVV or service-role credential anywhere in the frontend.

Only non-sensitive payment configuration should be displayed.

## Launch recommendation

Before September 5:

1. Configure the official Academy UPI/payment details.
2. Test a small real transaction.
3. Verify the transaction from Admin.
4. Confirm the student sees `verified`.
5. Confirm duplicate UTR is rejected by the database unique index.
6. Confirm rejected payment remains rejected.
7. Test payment flow on all three required networks.
8. Reconcile the transaction outside the app before treating it as revenue.

## Gateway note

This phase does not invent or configure a payment gateway. A gateway can be integrated later if required. Manual UPI + UTR is kept separate from existing tutor registration payment logic.
