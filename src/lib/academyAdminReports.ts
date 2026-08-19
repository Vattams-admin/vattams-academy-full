export type AdminMetricSnapshot = {
  students: number;
  activeStudents: number;
  tutors: number;
  pendingTutorApprovals: number;
  activeCourses: number;
  upcomingClasses: number;
  pendingPayments: number;
  pendingGrading: number;
  attendanceReviews: number;
  pendingSettlements: number;
};

export type ReportRow = {
  label: string;
  value: number;
  detail?: string;
};

export function getAdminAttentionCount(metrics: AdminMetricSnapshot) {
  return (
    metrics.pendingTutorApprovals +
    metrics.pendingPayments +
    metrics.pendingGrading +
    metrics.attendanceReviews +
    metrics.pendingSettlements
  );
}

export function buildAdminReportRows(metrics: AdminMetricSnapshot): ReportRow[] {
  return [
    { label: 'Total Students', value: metrics.students },
    { label: 'Active Students', value: metrics.activeStudents },
    { label: 'Tutors', value: metrics.tutors },
    { label: 'Active Courses', value: metrics.activeCourses },
    { label: 'Upcoming Classes', value: metrics.upcomingClasses },
    { label: 'Pending Tutor Approvals', value: metrics.pendingTutorApprovals },
    { label: 'Pending Payments', value: metrics.pendingPayments },
    { label: 'Pending Grading', value: metrics.pendingGrading },
    { label: 'Attendance Reviews', value: metrics.attendanceReviews },
    { label: 'Pending Settlements', value: metrics.pendingSettlements },
  ];
}
