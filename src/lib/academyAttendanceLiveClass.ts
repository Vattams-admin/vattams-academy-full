export type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'late'
  | 'excused'
  | 'pending';

export type AcademyAttendanceRecord = {
  id: string;
  classId: string;
  studentId: string;
  tutorId: string;
  sessionDate: string;
  status: AttendanceStatus;
  joinedAt?: string;
  leftAt?: string;
  minutesAttended?: number;
  markedAt?: string;
  markedBy?: string;
};

export type LiveClassStatus =
  | 'scheduled'
  | 'live'
  | 'completed'
  | 'cancelled';

export type AcademyLiveClass = {
  id: string;
  courseId: string;
  tutorId: string;
  title: string;
  startAt: string;
  endAt: string;
  meetingUrl?: string;
  status: LiveClassStatus;
  active: boolean;
};

export function calculateAttendancePercentage(
  records: AcademyAttendanceRecord[],
) {
  const eligible = records.filter(
    (record) => record.status !== 'pending',
  );
  if (eligible.length === 0) return 0;

  const attended = eligible.filter(
    (record) =>
      record.status === 'present' ||
      record.status === 'late',
  ).length;

  return Math.round((attended / eligible.length) * 100);
}

export function canJoinLiveClass(
  liveClass: AcademyLiveClass,
  now = Date.now(),
) {
  const start = new Date(liveClass.startAt).getTime();
  const end = new Date(liveClass.endAt).getTime();

  return (
    liveClass.active &&
    (liveClass.status === 'scheduled' || liveClass.status === 'live') &&
    now >= start - 15 * 60 * 1000 &&
    now <= end
  );
}

export function markAttendance(
  record: AcademyAttendanceRecord,
  status: Exclude<AttendanceStatus, 'pending'>,
  actorId: string,
) {
  return {
    ...record,
    status,
    markedAt: new Date().toISOString(),
    markedBy: actorId,
  };
}
