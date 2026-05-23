import { dayKey, dayLabel } from "./format";
import { computePoints } from "./scoring";
import type { DbMatch, DbPrediction } from "./supabase/types";

export type CardState = "finished" | "live" | "predicted" | "missing" | "locked";

export type UiMatch = {
  id: string;
  state: CardState;
  homeCode: string | null;
  awayCode: string | null;
  homeName: string;
  awayName: string;
  kickoff: Date;
  homeScore: number | null;
  awayScore: number | null;
  round: string;
  groupName: string | null;
  stadium: string | null;
  stadiumCity: string | null;
  userPoints: number | null;
  userPrediction: { home: number; away: number } | null;
  predictorsReady: number;
  predictorsTotal: number;
};

export type MatchListContext = {
  myPredictions: Map<string, DbPrediction>; // keyed by match_id
  predictorCounts: Map<string, number>; // keyed by match_id
  totalPlayers: number;
};

const EMPTY_CONTEXT: MatchListContext = {
  myPredictions: new Map(),
  predictorCounts: new Map(),
  totalPlayers: 0,
};

export function toUiMatch(row: DbMatch, ctx: MatchListContext = EMPTY_CONTEXT): UiMatch {
  const homeMissing = !row.home_team || !row.home_team_code;
  const awayMissing = !row.away_team || !row.away_team_code;
  const tbd = homeMissing || awayMissing;
  const kickoff = new Date(row.kickoff_utc);
  const hasKickedOff = Date.now() >= kickoff.getTime();

  const mine = ctx.myPredictions.get(row.id) ?? null;

  let state: CardState;
  if (row.status === "completed") state = "finished";
  else if (tbd) state = "locked";
  else if (row.status === "live" || hasKickedOff) state = "live";
  else if (mine) state = "predicted";
  else state = "missing";

  // For 'live' the DB trigger hasn't persisted points yet — show preliminary
  // points based on the current score. For 'finished' use the stored value.
  const userPoints = mine
    ? state === "live"
      ? computePoints({
          round: row.round,
          homeScore: row.home_score,
          awayScore: row.away_score,
          homePen: row.home_pen,
          awayPen: row.away_pen,
          predHome: mine.home_score,
          predAway: mine.away_score,
          predPenWinner: mine.penalty_winner,
          homeTeam: row.home_team,
          awayTeam: row.away_team,
        })
      : (mine.points ?? null)
    : null;

  return {
    id: row.id,
    state,
    homeCode: row.home_team_code,
    awayCode: row.away_team_code,
    homeName: row.home_team ?? "—",
    awayName: row.away_team ?? "—",
    kickoff,
    homeScore: row.home_score,
    awayScore: row.away_score,
    round: row.round,
    groupName: row.group_name,
    stadium: row.stadium,
    stadiumCity: row.stadium_city,
    userPoints,
    userPrediction: mine
      ? { home: mine.home_score, away: mine.away_score }
      : null,
    predictorsReady: ctx.predictorCounts.get(row.id) ?? 0,
    predictorsTotal: ctx.totalPlayers,
  };
}

const GROUP_ORDER = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

function groupSortIndex(groupName: string) {
  const normalized = groupName.replace(/^group\s+/i, "").trim().toUpperCase();
  const index = GROUP_ORDER.indexOf(normalized);
  return index === -1 ? GROUP_ORDER.length : index;
}

function groupLabel(groupName: string) {
  const normalized = groupName.replace(/^group\s+/i, "").trim().toUpperCase();
  return `Grupo ${normalized}`;
}

export type TournamentGroup = { key: string; label: string; items: UiMatch[] };

export function groupByTournamentGroup(matches: UiMatch[]): TournamentGroup[] {
  const sorted = [...matches]
    .filter((m) => m.round === "group" && m.groupName)
    .sort((a, b) => {
      const groupDelta =
        groupSortIndex(a.groupName as string) - groupSortIndex(b.groupName as string);
      if (groupDelta !== 0) return groupDelta;
      return a.kickoff.getTime() - b.kickoff.getTime();
    });

  const groups: TournamentGroup[] = [];
  let cur: TournamentGroup | null = null;
  for (const m of sorted) {
    const key = (m.groupName as string).replace(/^group\s+/i, "").trim().toUpperCase();
    if (!cur || cur.key !== key) {
      cur = { key, label: groupLabel(key), items: [] };
      groups.push(cur);
    }
    cur.items.push(m);
  }
  return groups;
}

export type DayGroup = { key: string; label: string; date: Date; items: UiMatch[] };

export function groupByDay(matches: UiMatch[]): DayGroup[] {
  const sorted = [...matches].sort((a, b) => a.kickoff.getTime() - b.kickoff.getTime());
  const groups: DayGroup[] = [];
  let cur: DayGroup | null = null;
  for (const m of sorted) {
    const key = dayKey(m.kickoff);
    if (!cur || cur.key !== key) {
      cur = { key, label: dayLabel(m.kickoff), date: m.kickoff, items: [] };
      groups.push(cur);
    }
    cur.items.push(m);
  }
  return groups;
}
