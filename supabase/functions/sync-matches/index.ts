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

// Polling policy:
// - Kickoff itself is handled by the app from kickoff_utc, so API polling is
//   mostly for score freshness and newly resolved knockout teams.
// - Use the shortest applicable interval across all matches, keeping the daily
//   free-tier budget safe while giving live knockout matches a better feel.
const IDLE_TOURNAMENT_POLL_MIN = 8 * 60;
const SAME_DAY_POLL_MIN = 60;
const NEAR_KICKOFF_MIN = 2 * 60;
const NEAR_KICKOFF_POLL_MIN = 30;
const OPENING_WINDOW_MIN = 10;
const OPENING_POLL_MIN = 5;
const GROUP_LIVE_POLL_MIN = 10;
const KO_LIVE_POLL_MIN = 7;
const CLOSING_POLL_MIN = 5;
const STALE_UNRESOLVED_POLL_MIN = 30;
const TOURNAMENT_MARGIN_MIN = 7 * 24 * 60;
const GROUP_DURATION = 110; // 90 + stoppage
const KO_DURATION = 180; // 90 + ET + HT + pens + buffer

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
  return isKnockout(round) ? KO_DURATION : GROUP_DURATION;
}

function needForMatch(now: Date, match: MatchRow): SyncNeed | null {
  const kickoff = new Date(match.kickoff_utc);
  const minToKickoff = minutesBetween(kickoff, now);
  const minSinceKickoff = minutesBetween(now, kickoff);

  if (match.status !== "completed" && minSinceKickoff >= 0) {
    if (minSinceKickoff <= OPENING_WINDOW_MIN) {
      return {
        threshold: OPENING_POLL_MIN,
        reason: "opening kickoff window",
        priority: 1,
      };
    }

    const regularLiveThreshold = isKnockout(match.round)
      ? KO_LIVE_POLL_MIN
      : GROUP_LIVE_POLL_MIN;
    const liveThreshold =
      minSinceKickoff >= expectedDurationMin(match.round)
        ? CLOSING_POLL_MIN
        : regularLiveThreshold;
    const staleThreshold =
      minSinceKickoff > expectedDurationMin(match.round) + 60
        ? STALE_UNRESOLVED_POLL_MIN
        : liveThreshold;

    return {
      threshold: staleThreshold,
      reason: isKnockout(match.round) ? "knockout match unresolved" : "group match unresolved",
      priority: 2,
    };
  }

  if (minToKickoff > 0 && minToKickoff <= NEAR_KICKOFF_MIN) {
    return {
      threshold: NEAR_KICKOFF_POLL_MIN,
      reason: "near kickoff",
      priority: 3,
    };
  }

  if (minToKickoff > 0 && minToKickoff <= 24 * 60) {
    return {
      threshold: SAME_DAY_POLL_MIN,
      reason: "same-day upcoming match",
      priority: 4,
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
    priority: 5,
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
  return { synced: filteredRows.length, skipped_test: testIds.size };
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
