import { dayKey, dayLabel } from "./format";
import type { DbMatch } from "./supabase/types";

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
  stadium: string | null;
  stadiumCity: string | null;
  // V1 placeholders until predictions/auth land:
  userPoints: number | null;
  predictorsReady: number;
  predictorsTotal: number;
};

const PLACEHOLDER_TOTAL_PLAYERS = 9;

export function toUiMatch(row: DbMatch): UiMatch {
  const homeMissing = !row.home_team || !row.home_team_code;
  const awayMissing = !row.away_team || !row.away_team_code;
  const tbd = homeMissing || awayMissing;

  let state: CardState;
  if (row.status === "completed") state = "finished";
  else if (row.status === "live") state = "live";
  else if (tbd) state = "locked";
  else state = "missing";

  return {
    id: row.id,
    state,
    homeCode: row.home_team_code,
    awayCode: row.away_team_code,
    homeName: row.home_team ?? "—",
    awayName: row.away_team ?? "—",
    kickoff: new Date(row.kickoff_utc),
    homeScore: row.home_score,
    awayScore: row.away_score,
    stadium: row.stadium,
    stadiumCity: row.stadium_city,
    userPoints: null,
    predictorsReady: 0,
    predictorsTotal: PLACEHOLDER_TOTAL_PLAYERS,
  };
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
