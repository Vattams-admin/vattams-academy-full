export type ClassroomSessionStatus =
  | 'scheduled'
  | 'live'
  | 'completed'
  | 'cancelled';

export type ClassroomSession = {
  id: string;
  courseId: string;
  tutorId: string;
  title: string;
  startAt: string;
  endAt: string;
  meetingUrl?: string;
  status: ClassroomSessionStatus;
};

export function getClassroomSessionStatus(
  session: ClassroomSession,
  now = Date.now(),
): ClassroomSessionStatus {
  if (session.status === 'cancelled') return 'cancelled';

  const start = new Date(session.startAt).getTime();
  const end = new Date(session.endAt).getTime();

  if (now < start) return 'scheduled';
  if (now >= start && now <= end) return 'live';
  return 'completed';
}

export function sortClassroomSessions(sessions: ClassroomSession[]) {
  return [...sessions].sort(
    (a, b) =>
      new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
  );
}

export function canJoinClassroom(
  session: ClassroomSession,
  now = Date.now(),
) {
  const status = getClassroomSessionStatus(session, now);
  return status === 'live' && Boolean(session.meetingUrl);
}
