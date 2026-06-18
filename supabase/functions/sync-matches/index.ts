import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const API_URL = Deno.env.get("WC2026_API_URL")!;
const API_KEY = Deno.env.get("WC2026_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CRON_SECRET = Deno.env.get("CRON_SECRET")!;

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Polling policy for the 500-call daily API allowance:
// - Cron invokes this function every minute, but only syncMatches() spends an
//   upstream call. decide() uses the fixture schedule to throttle those calls.
// - The shortest applicable interval wins when match windows overlap.
// - The closing windows use one-minute polling only where late finishes, extra
//   time, or penalties make that freshness valuable. A full-schedule simulation
//   peaks at 442 calls in any rolling 24 hours, leaving a 58-call reserve.
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
const GROUP_DURATION_MIN = 135; // 90 + half-time + stoppage/delay margin
const KO_DURATION_MIN = 180; // regulation + ET + penalties + delay margin
const STATS_FETCH_LIMIT = 4;
const STATS_RETRY_MIN = 30;

type MatchRow = {
  kickoff_utc: string;
  round: string;
  status: "scheduled" | "live" | "completed";
  synced_at: string | null;
};

type SyncNeed = {
  threshold: number;
  reason: string;
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
  return isKnockout(round)
    ? KO_CLOSING_START_MIN
    : GROUP_CLOSING_START_MIN;
}

function needForMatch(now: Date, match: MatchRow): SyncNeed | null {
  const kickoff = new Date(match.kickoff_utc);
  const minToKickoff = minutesBetween(kickoff, now);
  const minSinceKickoff = minutesBetween(now, kickoff);

  if (match.status !== "completed" && minSinceKickoff >= 0) {
    const expectedDuration = expectedDurationMin(match.round);

    if (minSinceKickoff <= expectedDuration) {
      const closing = minSinceKickoff >= closingWindowStartMin(match.round);
      return {
        threshold: closing ? CLOSING_POLL_MIN : LIVE_POLL_MIN,
        reason: closing
          ? isKnockout(match.round)
            ? "knockout closing window"
            : "group closing window"
          : isKnockout(match.round)
            ? "knockout match live window"
            : "group match live window",
        priority: 1,
      };
    }

    const inCompletionGrace =
      minSinceKickoff <= expectedDuration + COMPLETION_GRACE_MIN;

    return {
      threshold: inCompletionGrace
        ? COMPLETION_GRACE_POLL_MIN
        : STALE_UNRESOLVED_POLL_MIN,
      reason: inCompletionGrace
        ? "awaiting completed status"
        : "stale unresolved match",
      priority: 2,
    };
  }

  if (minToKickoff > 0 && minToKickoff <= KICKOFF_WARMUP_MIN) {
    return {
      threshold: KICKOFF_WARMUP_POLL_MIN,
      reason: "kickoff warmup",
      priority: 3,
    };
  }

  if (minToKickoff > 0 && minToKickoff <= NEAR_KICKOFF_MIN) {
    return {
      threshold: NEAR_KICKOFF_POLL_MIN,
      reason: "near kickoff",
      priority: 4,
    };
  }

  if (minToKickoff > 0 && minToKickoff <= 24 * 60) {
    return {
      threshold: SAME_DAY_POLL_MIN,
      reason: "same-day upcoming match",
      priority: 5,
    };
  }

  return null;
}

function idleTournamentNeed(now: Date, matches: MatchRow[]): SyncNeed | null {
  const kickoffs = matches
    .map((m) => new Date(m.kickoff_utc).getTime())
    .filter(Number.isFinite);
  if (kickoffs.length === 0) return null;

  const first = Math.min(...kickoffs) - TOURNAMENT_MARGIN_MIN * 60_000;
  const last = Math.max(...kickoffs) + TOURNAMENT_MARGIN_MIN * 60_000;
  const t = now.getTime();
  if (t < first || t > last) return null;

  return {
    threshold: IDLE_TOURNAMENT_POLL_MIN,
    reason: "idle tournament fixture refresh",
    priority: 6,
  };
}

function chooseNeed(now: Date, matches: MatchRow[]): SyncNeed | null {
  const needs = matches
    .map((match) => needForMatch(now, match))
    .filter((need): need is SyncNeed => need !== null);
  const idleNeed = idleTournamentNeed(now, matches);
  if (idleNeed) needs.push(idleNeed);
  needs.sort((a, b) => a.threshold - b.threshold || a.priority - b.priority);
  return needs[0] ?? null;
}

async function decide() {
  const now = new Date();

  const { data: rows, error } = await sb
    .from("matches")
    .select("kickoff_utc, round, status, synced_at")
    .eq("is_test", false);
  if (error) throw error;

  const matches = (rows ?? []) as MatchRow[];
  if (matches.length === 0) {
    return {
      sync: true,
      reason: "bootstrap",
      minSinceSync: null,
      threshold: 0,
    };
  }

  const syncedTimes = matches
    .map((row) => (row.synced_at ? new Date(row.synced_at).getTime() : 0))
    .filter(Number.isFinite);
  const lastSync = syncedTimes.length > 0
    ? new Date(Math.max(...syncedTimes))
    : new Date(0);
  const minSinceSync = (now.getTime() - lastSync.getTime()) / 60_000;

  const need = chooseNeed(now, matches);
  const sync = !!need && minSinceSync >= need.threshold;
  const reason = !need
    ? "outside tournament sync window"
    : sync
      ? need.reason
      : `throttled: ${need.reason}`;

  return {
    sync,
    reason,
    minSinceSync: Number(minSinceSync.toFixed(1)),
    threshold: need?.threshold ?? null,
  };
}

// Advances synced_at even when the upstream API fails, so decide()'s
// self-throttle ticks forward. Without this, a persistent 429 makes every
// cron run hit the API and blow the daily quota.
async function markAttempt() {
  await sb
    .from("matches")
    .update({ synced_at: new Date().toISOString() })
    .not("id", "is", null);
}

async function syncMatches() {
  const res = await fetch(`${API_URL}/matches`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  if (!res.ok) {
    await markAttempt();
    throw new Error(`API ${res.status}: ${await res.text()}`);
  }
  let matches: Array<Record<string, unknown>>;
  try {
    matches = (await res.json()) as Array<Record<string, unknown>>;
  } catch (err) {
    await markAttempt();
    throw err;
  }
  const synced_at = new Date().toISOString();

  const rows = matches.map((m) => ({
    id: String(m.id),
    match_number: m.match_number,
    round: m.round,
    group_name: m.group_name,
    home_team: m.home_team,
    away_team: m.away_team,
    home_team_code: m.home_team_code,
    away_team_code: m.away_team_code,
    stadium: m.stadium,
    stadium_city: m.stadium_city,
    kickoff_utc: m.kickoff_utc,
    home_score: m.home_score,
    away_score: m.away_score,
    home_pen: m.home_pen,
    away_pen: m.away_pen,
    phase: typeof m.phase === "string" ? m.phase : null,
    match_minute: typeof m.match_minute === "number" ? m.match_minute : null,
    status: m.status,
    synced_at,
  }));

  // Don't clobber rows the admin has put into test mode.
  const { data: testRows } = await sb.from("matches").select("id").eq("is_test", true);
  const testIds = new Set((testRows ?? []).map((r) => r.id as string));
  const filteredRows = rows.filter((r) => !testIds.has(r.id));

  const { error } = await sb.from("matches").upsert(filteredRows);
  if (error) {
    await markAttempt();
    throw error;
  }

  const statsResult = await syncCompletedMatchStats(filteredRows);
  return {
    synced: filteredRows.length,
    skipped_test: testIds.size,
    ...statsResult,
  };
}

type MatchStatsRow = {
  match_id: string;
  stats: Record<string, unknown> | null;
  last_attempted_at: string | null;
  last_error: string | null;
};

function shouldFetchStats(row: MatchStatsRow | undefined, now: Date) {
  if (!row) return true;
  if (row.stats) return false;
  if (!row.last_attempted_at) return true;
  const minSinceAttempt = minutesBetween(now, new Date(row.last_attempted_at));
  return !!row.last_error && minSinceAttempt >= STATS_RETRY_MIN;
}

async function recordStatsAttempt(matchId: string, lastError: string) {
  const attemptedAt = new Date().toISOString();
  const { error } = await sb.from("match_stats").upsert({
    match_id: matchId,
    last_attempted_at: attemptedAt,
    last_error: lastError,
    synced_at: attemptedAt,
  });
  if (error) console.error(`Failed to record stats attempt for ${matchId}:`, error);
}

async function syncCompletedMatchStats(rows: Array<{ id: string; status: unknown }>) {
  const completedIds = rows
    .filter((row) => row.status === "completed")
    .map((row) => row.id);
  if (completedIds.length === 0) {
    return { stats_synced: 0, stats_failed: 0, stats_skipped: 0 };
  }

  const { data: existingRows, error } = await sb
    .from("match_stats")
    .select("match_id, stats, last_attempted_at, last_error")
    .in("match_id", completedIds);
  if (error) {
    console.error("Failed to load existing match stats:", error);
    return { stats_synced: 0, stats_failed: 0, stats_skipped: completedIds.length };
  }

  const now = new Date();
  const existing = new Map(
    ((existingRows ?? []) as MatchStatsRow[]).map((row) => [row.match_id, row])
  );
  const queuedIds = completedIds
    .filter((id) => shouldFetchStats(existing.get(id), now))
    .slice(0, STATS_FETCH_LIMIT);

  let statsSynced = 0;
  let statsFailed = 0;

  for (const matchId of queuedIds) {
    const attemptedAt = new Date().toISOString();
    try {
      const res = await fetch(`${API_URL}/matches/${matchId}/stats`, {
        headers: { Authorization: `Bearer ${API_KEY}` },
      });
      if (!res.ok) {
        statsFailed += 1;
        await recordStatsAttempt(matchId, `API ${res.status}: ${await res.text()}`);
        continue;
      }

      const payload = (await res.json()) as Record<string, unknown>;
      const stats = payload.stats;
      const timeline = payload.timeline;
      if (
        !stats ||
        typeof stats !== "object" ||
        Array.isArray(stats) ||
        !Array.isArray(timeline)
      ) {
        statsFailed += 1;
        await recordStatsAttempt(matchId, "Invalid stats payload");
        continue;
      }

      const { error: upsertError } = await sb.from("match_stats").upsert({
        match_id: matchId,
        stats,
        timeline,
        source_fetched_at:
          typeof payload.fetched_at === "string" ? payload.fetched_at : null,
        last_attempted_at: attemptedAt,
        last_error: null,
        synced_at: attemptedAt,
      });
      if (upsertError) {
        statsFailed += 1;
        console.error(`Failed to upsert stats for ${matchId}:`, upsertError);
        continue;
      }
      statsSynced += 1;
    } catch (err) {
      statsFailed += 1;
      await recordStatsAttempt(matchId, String(err));
    }
  }

  return {
    stats_synced: statsSynced,
    stats_failed: statsFailed,
    stats_skipped: completedIds.length - queuedIds.length,
  };
}

Deno.serve(async (req) => {
  if (req.headers.get("x-cron-secret") !== CRON_SECRET) {
    return new Response("forbidden", { status: 403 });
  }
  const force = req.headers.get("x-force-sync") === "1";
  try {
    if (force) {
      const result = await syncMatches();
      return Response.json({ ...result, forced: true });
    }
    const decision = await decide();
    if (!decision.sync) {
      return Response.json({ skipped: true, ...decision });
    }
    const result = await syncMatches();
    return Response.json({ ...result, ...decision });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
});
