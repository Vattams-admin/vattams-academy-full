export type AcademyPaymentMethod = 'gpay' | 'upi' | 'bank_transfer';

export type AcademyPaymentStatus =
  | 'pending'
  | 'submitted'
  | 'under_review'
  | 'verified'
  | 'rejected'
  | 'refunded';

export type AcademyPayment = {
  id: string;
  studentId: string;
  purpose: 'course_fee' | 'tutor_joining_fee' | 'other';
  referenceId?: string;
  amount: number;
  method: AcademyPaymentMethod;
  utr?: string;
  status: AcademyPaymentStatus;
  submittedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
};

export type AcademyFee = {
  id: string;
  name: string;
  description: string;
  amount: number;
  currency: 'INR';
  active: boolean;
};

export function validatePaymentAmount(amount: number) {
  return Number.isFinite(amount) && amount > 0;
}

export function validateUtr(utr: string) {
  const value = utr.trim();
  return value.length >= 6 && value.length <= 40;
}

export function createPaymentSubmission(input: {
  studentId: string;
  purpose: AcademyPayment['purpose'];
  amount: number;
  method: AcademyPaymentMethod;
  utr: string;
}): AcademyPayment {
  if (!validatePaymentAmount(input.amount)) {
    throw new Error('Enter a valid payment amount.');
  }

  if (!validateUtr(input.utr)) {
    throw new Error('Enter a valid UTR / transaction reference.');
  }

  return {
    id: `payment-${Date.now()}`,
    studentId: input.studentId,
    purpose: input.purpose,
    amount: input.amount,
    method: input.method,
    utr: input.utr.trim(),
    status: 'submitted',
    submittedAt: new Date().toISOString(),
  };
}

export function calculateOutstanding(
  feeAmount: number,
  verifiedPayments: number[],
) {
  const paid = verifiedPayments.reduce((sum, value) => sum + value, 0);
  return Math.max(0, feeAmount - paid);
}
