export type CompetitionStatus = 'draft' | 'upcoming' | 'live' | 'completed' | 'cancelled';

export type AcademyCompetition = {
  id: string;
  title: string;
  description: string;
  category: string;
  startAt: string;
  endAt: string;
  maxParticipants?: number;
  status: CompetitionStatus;
  active: boolean;
};

export type CompetitionResult = {
  competitionId: string;
  studentId: string;
  studentName: string;
  score: number;
  maxScore: number;
  rank: number;
  submittedAt: string;
};

export function calculatePercentage(score: number, maxScore: number) {
  if (maxScore <= 0) return 0;
  return Math.max(0, Math.min(100, (score / maxScore) * 100));
}

export function getLeaderboard(results: CompetitionResult[]) {
  return [...results].sort(
    (a, b) =>
      b.score - a.score ||
      new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
  );
}

export function canRegisterForCompetition(
  competition: AcademyCompetition,
  now = Date.now(),
) {
  return (
    competition.active &&
    (competition.status === 'upcoming' || competition.status === 'live') &&
    new Date(competition.endAt).getTime() >= now
  );
}
