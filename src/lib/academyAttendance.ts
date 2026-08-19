export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export type AttendanceRecord = {
  id: string;
  studentId: string;
  courseId: string;
  classId: string;
  sessionDate: string;
  status: AttendanceStatus;
  markedAt?: string;
  markedBy?: string;
};

export type AttendanceSummary = {
  totalSessions: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
};

export function calculateAttendanceSummary(
  records: AttendanceRecord[],
): AttendanceSummary {
  const totalSessions = records.length;
  const present = records.filter((r) => r.status === 'present').length;
  const absent = records.filter((r) => r.status === 'absent').length;
  const late = records.filter((r) => r.status === 'late').length;
  const excused = records.filter((r) => r.status === 'excused').length;

  const attended = present + late;
  const percentage =
    totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : 0;

  return {
    totalSessions,
    present,
    absent,
    late,
    excused,
    percentage,
  };
}

export function canMarkAttendance(status: AttendanceStatus) {
  return ['present', 'absent', 'late', 'excused'].includes(status);
}
