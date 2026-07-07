import type { DbMatch } from "./supabase/types";

const IDLE_TOURNAMENT_POLL_MIN = 6 * 60;
const SAME_DAY_POLL_MIN = 60;
const NEAR_KICKOFF_MIN = 60;
const NEAR_KICKOFF_POLL_MIN = 10;
const KICKOFF_WARMUP_MIN = 15;
const KICKOFF_WARMUP_POLL_MIN = 5;
const LIVE_POLL_MIN = 2;
const GROUP_CLOSING_START_MIN = 120;
const KO_CLOSING_START_MIN = 135;
const CLOSING_POLL_MIN = 1;
const COMPLETION_GRACE_MIN = 45;
const COMPLETION_GRACE_POLL_MIN = 15;
const STALE_UNRESOLVED_POLL_MIN = 60;
const TOURNAMENT_MARGIN_MIN = 7 * 24 * 60;
const GROUP_DURATION_MIN = 135;
const KO_DURATION_MIN = 180;
const CLIENT_REFRESH_GRACE_MS = 8_000;

type RefreshMatch = Pick<DbMatch, "kickoff_utc" | "round" | "status" | "synced_at">;

type RefreshNeed = {
  thresholdMin: number;
  priority: number;
};

function minutesBetween(a: Date, b: Date) {
  return (a.getTime() - b.getTime()) / 60_000;
}

function isKnockout(round: string) {
  return round !== "group";
}

function expectedDurationMin(round: string) {
  return isKnockout(round) ? KO_DURATION_MIN : GROUP_DURATION_MIN;
}

function closingWindowStartMin(round: string) {
  return isKnockout(round) ? KO_CLOSING_START_MIN : GROUP_CLOSING_START_MIN;
}

function needForMatch(now: Date, match: RefreshMatch): RefreshNeed | null {
  const kickoff = new Date(match.kickoff_utc);
  const minToKickoff = minutesBetween(kickoff, now);
  const minSinceKickoff = minutesBetween(now, kickoff);

  if (match.status !== "completed" && minSinceKickoff >= 0) {
    const expectedDuration = expectedDurationMin(match.round);

    if (minSinceKickoff <= expectedDuration) {
      return {
        thresholdMin:
          minSinceKickoff >= closingWindowStartMin(match.round)
            ? CLOSING_POLL_MIN
            : LIVE_POLL_MIN,
        priority: 1,
      };
    }

    return {
      thresholdMin:
        minSinceKickoff <= expectedDuration + COMPLETION_GRACE_MIN
          ? COMPLETION_GRACE_POLL_MIN
          : STALE_UNRESOLVED_POLL_MIN,
      priority: 2,
    };
  }

  if (minToKickoff > 0 && minToKickoff <= KICKOFF_WARMUP_MIN) {
    return { thresholdMin: KICKOFF_WARMUP_POLL_MIN, priority: 3 };
  }

  if (minToKickoff > 0 && minToKickoff <= NEAR_KICKOFF_MIN) {
    return { thresholdMin: NEAR_KICKOFF_POLL_MIN, priority: 4 };
  }

  if (minToKickoff > 0 && minToKickoff <= 24 * 60) {
    return { thresholdMin: SAME_DAY_POLL_MIN, priority: 5 };
  }

  return null;
}

function idleTournamentNeed(now: Date, matches: RefreshMatch[]): RefreshNeed | null {
  const kickoffs = matches
    .map((m) => new Date(m.kickoff_utc).getTime())
    .filter(Number.isFinite);
  if (kickoffs.length === 0) return null;

  const first = Math.min(...kickoffs) - TOURNAMENT_MARGIN_MIN * 60_000;
  const last = Math.max(...kickoffs) + TOURNAMENT_MARGIN_MIN * 60_000;
  const nowMs = now.getTime();
  if (nowMs < first || nowMs > last) return null;

  return { thresholdMin: IDLE_TOURNAMENT_POLL_MIN, priority: 6 };
}

function chooseNeed(now: Date, matches: RefreshMatch[]) {
  const needs = matches
    .map((match) => needForMatch(now, match))
    .filter((need): need is RefreshNeed => need !== null);
  const idleNeed = idleTournamentNeed(now, matches);
  if (idleNeed) needs.push(idleNeed);

  needs.sort(
    (a, b) => a.thresholdMin - b.thresholdMin || a.priority - b.priority
  );
  return needs[0] ?? null;
}

export function getNextMatchRefreshAt(
  matches: RefreshMatch[],
  now = new Date()
): string | undefined {
  if (matches.length === 0) return undefined;

  const syncedTimes = matches
    .map((row) => new Date(row.synced_at).getTime())
    .filter(Number.isFinite);
  if (syncedTimes.length === 0) return undefined;

  const need = chooseNeed(now, matches);
  if (!need) return undefined;

  const lastSyncMs = Math.max(...syncedTimes);
  return new Date(
    lastSyncMs + need.thresholdMin * 60_000 + CLIENT_REFRESH_GRACE_MS
  ).toISOString();
}
