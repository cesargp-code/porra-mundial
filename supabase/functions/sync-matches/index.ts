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

// Polling policy: poll only while at least one match's "active window"
// covers wall-clock now. Outside any window, skip — saves quota on idle
// days. Inside, throttle to one API call per POLL_INTERVAL_MIN.
const POLL_INTERVAL_MIN = 10;
const PRE_KICKOFF_MIN   = 10;   // window starts N min before kickoff
const POST_MATCH_MIN    = 30;   // window stays open N min after expected end
const GROUP_DURATION    = 110;  // 90 + stoppage
const KO_DURATION       = 180;  // 90 + ET + HT + pens + buffer

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

  const { data: active } = await sb.rpc("any_match_active_now", {
    p_pre_min:   PRE_KICKOFF_MIN,
    p_post_min:  POST_MATCH_MIN,
    p_group_dur: GROUP_DURATION,
    p_ko_dur:    KO_DURATION,
  });

  const inWindow = active === true;
  const sync = inWindow && minSinceSync >= POLL_INTERVAL_MIN;
  const reason = !inWindow
    ? "no active match window"
    : sync
      ? "active window"
      : "throttled";

  return {
    sync,
    reason,
    inWindow,
    minSinceSync: Number(minSinceSync.toFixed(1)),
    threshold: POLL_INTERVAL_MIN,
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
