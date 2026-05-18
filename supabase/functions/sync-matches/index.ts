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

type Phase = "live" | "pre_match" | "post_match" | "inactive";

// Minutes between API calls per phase. Cron fires every 5 min; the function
// self-throttles. Budget target: ≤80 calls/day (free-tier cap is 100).
const MIN_INTERVAL_MIN: Record<Phase, number> = {
  live: 8,
  pre_match: 15,
  post_match: 15,
  inactive: 120,
};

async function decide() {
  const now = new Date();

  const { data: lastSyncRow } = await sb
    .from("matches")
    .select("synced_at")
    .order("synced_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const lastSync = lastSyncRow ? new Date(lastSyncRow.synced_at) : new Date(0);
  const minSinceSync = (now.getTime() - lastSync.getTime()) / 60_000;

  const { count: liveCount } = await sb
    .from("matches")
    .select("id", { count: "exact", head: true })
    .eq("status", "live");

  let phase: Phase = "inactive";
  let why = "no upcoming match";

  if ((liveCount ?? 0) > 0) {
    phase = "live";
    why = `${liveCount} live match(es)`;
  } else {
    const { data: next } = await sb
      .from("matches")
      .select("kickoff_utc")
      .eq("status", "scheduled")
      .gte("kickoff_utc", now.toISOString())
      .order("kickoff_utc", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (next) {
      const minToKick = (new Date(next.kickoff_utc).getTime() - now.getTime()) / 60_000;
      if (minToKick <= 60) {
        phase = "pre_match";
        why = `kickoff in ${minToKick.toFixed(0)} min`;
      }
    }

    if (phase === "inactive") {
      // Catch late status changes from a match that just ended.
      const threeHoursAgo = new Date(now.getTime() - 3 * 3_600_000).toISOString();
      const { count: recent } = await sb
        .from("matches")
        .select("id", { count: "exact", head: true })
        .eq("status", "completed")
        .gte("kickoff_utc", threeHoursAgo);
      if ((recent ?? 0) > 0) {
        phase = "post_match";
        why = "recent completed match";
      }
    }
  }

  const threshold = MIN_INTERVAL_MIN[phase];
  return {
    sync: minSinceSync >= threshold,
    phase,
    threshold,
    minSinceSync: Number(minSinceSync.toFixed(1)),
    why,
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
  const matches = (await res.json()) as Array<Record<string, unknown>>;
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
  if (error) throw error;
  return { synced: filteredRows.length, skipped_test: testIds.size };
}

Deno.serve(async (req) => {
  if (req.headers.get("x-cron-secret") !== CRON_SECRET) {
    return new Response("forbidden", { status: 403 });
  }
  try {
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
