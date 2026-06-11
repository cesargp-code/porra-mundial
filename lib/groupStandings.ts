import type { UiMatch } from "./matches";
import type { DbGroupStanding } from "./supabase/types";

type HeadToHeadStats = {
  points: number;
  goalDifference: number;
  goalsFor: number;
};

type MutableStanding = DbGroupStanding;

function teamKey(code: string | null, name: string | null) {
  return (code ?? name ?? "").trim().toUpperCase();
}

function standingKey(team: DbGroupStanding) {
  return teamKey(team.team_code, team.team_name);
}

function emptyStats(): HeadToHeadStats {
  return { points: 0, goalDifference: 0, goalsFor: 0 };
}

function addMatchStats(stats: HeadToHeadStats, goalsFor: number, goalsAgainst: number) {
  stats.goalsFor += goalsFor;
  stats.goalDifference += goalsFor - goalsAgainst;
  if (goalsFor > goalsAgainst) stats.points += 3;
  else if (goalsFor === goalsAgainst) stats.points += 1;
}

function headToHeadStats(
  tiedTeams: DbGroupStanding[],
  groupMatches: UiMatch[]
): Map<string, HeadToHeadStats> {
  const tiedKeys = new Set(tiedTeams.map(standingKey));
  const stats = new Map<string, HeadToHeadStats>();
  for (const key of tiedKeys) stats.set(key, emptyStats());

  for (const match of groupMatches) {
    if (match.state !== "finished") continue;
    if (match.homeScore === null || match.awayScore === null) continue;

    const homeKey = teamKey(match.homeCode, match.homeName);
    const awayKey = teamKey(match.awayCode, match.awayName);
    if (!tiedKeys.has(homeKey) || !tiedKeys.has(awayKey)) continue;

    addMatchStats(stats.get(homeKey) as HeadToHeadStats, match.homeScore, match.awayScore);
    addMatchStats(stats.get(awayKey) as HeadToHeadStats, match.awayScore, match.homeScore);
  }

  return stats;
}

function applyResult(
  standing: MutableStanding,
  goalsFor: number,
  goalsAgainst: number
) {
  standing.played += 1;
  standing.goals_for += goalsFor;
  standing.goals_against += goalsAgainst;
  standing.goal_difference += goalsFor - goalsAgainst;

  if (goalsFor > goalsAgainst) {
    standing.won += 1;
    standing.points += 3;
  } else if (goalsFor === goalsAgainst) {
    standing.drawn += 1;
    standing.points += 1;
  } else {
    standing.lost += 1;
  }
}

export function calculateGroupStandings(
  standings: DbGroupStanding[],
  groupMatches: UiMatch[]
): DbGroupStanding[] {
  const calculated = standings.map((standing) => ({
    ...standing,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goals_for: 0,
    goals_against: 0,
    goal_difference: 0,
    points: 0,
  }));
  const byTeam = new Map(calculated.map((standing) => [standingKey(standing), standing]));

  for (const match of groupMatches) {
    if (match.state !== "finished") continue;
    if (match.homeScore === null || match.awayScore === null) continue;

    const home = byTeam.get(teamKey(match.homeCode, match.homeName));
    const away = byTeam.get(teamKey(match.awayCode, match.awayName));
    if (!home || !away) continue;

    applyResult(home, match.homeScore, match.awayScore);
    applyResult(away, match.awayScore, match.homeScore);
  }

  return sortGroupStandings(calculated, groupMatches);
}

function compareByOverall(a: DbGroupStanding, b: DbGroupStanding) {
  return (
    b.goal_difference - a.goal_difference ||
    b.goals_for - a.goals_for ||
    a.position - b.position ||
    a.team_name.localeCompare(b.team_name)
  );
}

export function sortGroupStandings(
  standings: DbGroupStanding[],
  groupMatches: UiMatch[]
): DbGroupStanding[] {
  const byPoints = new Map<number, DbGroupStanding[]>();
  for (const team of standings) {
    byPoints.set(team.points, [...(byPoints.get(team.points) ?? []), team]);
  }

  return [...byPoints.entries()]
    .sort(([a], [b]) => b - a)
    .flatMap(([, tiedTeams]) => {
      if (tiedTeams.length === 1) return tiedTeams;

      const h2h = headToHeadStats(tiedTeams, groupMatches);
      return [...tiedTeams].sort((a, b) => {
        const aStats = h2h.get(standingKey(a)) ?? emptyStats();
        const bStats = h2h.get(standingKey(b)) ?? emptyStats();
        return (
          bStats.points - aStats.points ||
          bStats.goalDifference - aStats.goalDifference ||
          bStats.goalsFor - aStats.goalsFor ||
          compareByOverall(a, b)
        );
      });
    });
}
