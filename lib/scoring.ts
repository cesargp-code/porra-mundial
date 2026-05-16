// Mirrors public.compute_points() in the DB. Used to render preliminary
// points during a live match; the DB trigger persists final points when the
// match flips to 'completed'. Keep both implementations in sync.

const MULTIPLIERS: Record<string, number> = {
  group: 1,
  R32: 3,
  R16: 5,
  QF: 8,
  SF: 12,
  "3rd": 6,
  final: 15,
};

export function computePoints(args: {
  round: string;
  homeScore: number | null;
  awayScore: number | null;
  homePen: number | null;
  awayPen: number | null;
  predHome: number;
  predAway: number;
  predPenWinner: string | null;
  homeTeam: string | null;
  awayTeam: string | null;
}): number | null {
  const {
    round,
    homeScore,
    awayScore,
    homePen,
    awayPen,
    predHome,
    predAway,
    predPenWinner,
    homeTeam,
    awayTeam,
  } = args;

  if (homeScore === null || awayScore === null) return null;

  const realGd = homeScore - awayScore;
  const predGd = predHome - predAway;
  const realRes = realGd > 0 ? "H" : realGd < 0 ? "A" : "D";
  const predRes = predGd > 0 ? "H" : predGd < 0 ? "A" : "D";

  let base = 0;
  if (predHome === homeScore && predAway === awayScore) {
    base = 7;
  } else if (realRes === predRes) {
    if (realGd === predGd) base = 4;
    else if (Math.abs(predGd - realGd) === 1) base = 3;
    else base = 2;
  }

  let penBonus = 0;
  if (homePen !== null && awayPen !== null) {
    const penWinner = homePen > awayPen ? homeTeam : awayTeam;
    if (predPenWinner !== null && predPenWinner === penWinner) penBonus = 2;
  }

  let multiplier = MULTIPLIERS[round] ?? 1;
  if (homeTeam === "Spain" || awayTeam === "Spain") multiplier *= 2;

  return (base + penBonus) * multiplier;
}
