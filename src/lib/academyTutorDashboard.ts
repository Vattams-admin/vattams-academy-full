export type TutorDashboardSession = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  studentsCount: number;
};

export type TutorDashboardSummary = {
  assignedStudents: number;
  activeCourses: number;
  upcomingClasses: number;
  pendingAssignments: number;
  attendanceToReview: number;
  unreadNotifications: number;
};

export function getUpcomingTutorSessions(
  sessions: TutorDashboardSession[],
  now = Date.now(),
) {
  return sessions
    .filter(
      (session) =>
        session.status === 'scheduled' &&
        new Date(session.startAt).getTime() >= now,
    )
    .sort(
      (a, b) =>
        new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
    );
}

export function getTutorDashboardSummary(
  summary: TutorDashboardSummary,
) {
  return {
    ...summary,
    totalAttentionItems:
      summary.pendingAssignments +
      summary.attendanceToReview +
      summary.unreadNotifications,
  };
}
