export type GradingSubmissionStatus =
  | 'submitted'
  | 'under_review'
  | 'graded'
  | 'returned';

export type GradingSubmission = {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  status: GradingSubmissionStatus;
  marks?: number;
  maxMarks: number;
  feedback?: string;
  gradedAt?: string;
  gradedBy?: string;
};

export function calculatePercentage(marks: number, maxMarks: number) {
  if (maxMarks <= 0) return 0;
  return Math.max(0, Math.min(100, (marks / maxMarks) * 100));
}

export function validateMarks(marks: number, maxMarks: number) {
  return Number.isFinite(marks) && marks >= 0 && marks <= maxMarks;
}

export function gradeSubmission(
  submission: GradingSubmission,
  marks: number,
  feedback: string,
  tutorId: string,
): GradingSubmission {
  if (!validateMarks(marks, submission.maxMarks)) {
    throw new Error('Marks must be between 0 and the maximum marks.');
  }

  return {
    ...submission,
    marks,
    feedback: feedback.trim(),
    status: 'graded',
    gradedAt: new Date().toISOString(),
    gradedBy: tutorId,
  };
}

export function getPendingGradingCount(
  submissions: GradingSubmission[],
) {
  return submissions.filter(
    (submission) =>
      submission.status === 'submitted' ||
      submission.status === 'under_review',
  ).length;
}
