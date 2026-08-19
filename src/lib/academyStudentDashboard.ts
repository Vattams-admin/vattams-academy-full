export type EnrollmentStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export type StudentEnrollment = {
  id: string;
  studentId: string;
  courseId: string;
  courseTitle: string;
  enrolledAt: string;
  status: EnrollmentStatus;
  progressPercentage: number;
};

export type StudentDashboardSummary = {
  activeCourses: number;
  completedCourses: number;
  upcomingClasses: number;
  pendingAssignments: number;
  pendingTests: number;
  attendancePercentage: number;
};

export function getActiveEnrollments(enrollments: StudentEnrollment[]) {
  return enrollments.filter((item) => item.status === 'active');
}

export function getStudentDashboardSummary(
  enrollments: StudentEnrollment[],
  summary: StudentDashboardSummary,
) {
  return {
    ...summary,
    activeCourses: getActiveEnrollments(enrollments).length,
  };
}

export function canRequestEnrollment(courseId: string) {
  return Boolean(courseId.trim());
}
