export type TutorRateType = 'hourly';

export type TutorRate = {
  tutorId: string;
  rateType: TutorRateType;
  hourlyRate: number;
  currency: 'INR';
  effectiveFrom: string;
  active: boolean;
};

export type TutorTeachingSession = {
  id: string;
  tutorId: string;
  studentId?: string;
  courseId: string;
  sessionDate: string;
  durationMinutes: number;
  status: 'completed' | 'cancelled' | 'pending_review';
  approved: boolean;
};

export type TutorSettlement = {
  tutorId: string;
  periodStart: string;
  periodEnd: string;
  approvedMinutes: number;
  approvedHours: number;
  hourlyRate: number;
  grossAmount: number;
  deductions: number;
  netAmount: number;
  status: 'draft' | 'under_review' | 'approved' | 'paid';
};

export function calculateApprovedHours(
  sessions: TutorTeachingSession[],
) {
  const approvedMinutes = sessions
    .filter(
      (session) =>
        session.status === 'completed' && session.approved,
    )
    .reduce((sum, session) => sum + Math.max(0, session.durationMinutes), 0);

  return {
    approvedMinutes,
    approvedHours: approvedMinutes / 60,
  };
}

export function calculateTutorSettlement(
  sessions: TutorTeachingSession[],
  hourlyRate: number,
  deductions = 0,
): TutorSettlement {
  if (!Number.isFinite(hourlyRate) || hourlyRate < 0) {
    throw new Error('Invalid tutor hourly rate.');
  }

  const { approvedMinutes, approvedHours } =
    calculateApprovedHours(sessions);

  const grossAmount = approvedHours * hourlyRate;
  const safeDeductions = Math.max(0, Math.min(grossAmount, deductions));

  return {
    tutorId: sessions[0]?.tutorId || '',
    periodStart: sessions[0]?.sessionDate || '',
    periodEnd: sessions[sessions.length - 1]?.sessionDate || '',
    approvedMinutes,
    approvedHours,
    hourlyRate,
    grossAmount,
    deductions: safeDeductions,
    netAmount: grossAmount - safeDeductions,
    status: 'draft',
  };
}

export function validateTutorHourlyRate(rate: number) {
  return Number.isFinite(rate) && rate > 0;
}
