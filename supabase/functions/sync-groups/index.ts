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

const GROUP_NAMES = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

type ApiStanding = {
  group_name: unknown;
  team_id: unknown;
  team_name: unknown;
  team_code: unknown;
  flag_url: unknown;
  played: unknown;
  won: unknown;
  drawn: unknown;
  lost: unknown;
  goals_for: unknown;
  goals_against: unknown;
  goal_difference: unknown;
  points: unknown;
};

type ApiGroup = {
  id: unknown;
  name: unknown;
  standings: unknown;
};

function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asNullableString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function groupName(value: unknown) {
  if (typeof value !== "string") return null;
  const normalized = value.replace(/^group\s+/i, "").trim().toUpperCase();
  return /^[A-L]$/.test(normalized) ? normalized : null;
}

function groupsFromPayload(payload: unknown): ApiGroup[] {
  if (Array.isArray(payload)) return payload as ApiGroup[];
  if (
    payload &&
    typeof payload === "object" &&
    "groups" in payload &&
    Array.isArray((payload as { groups: unknown }).groups)
  ) {
    return (payload as { groups: ApiGroup[] }).groups;
  }
  return [];
}

async function syncGroups() {
  const indexRes = await fetch(`${API_URL}/groups`, {
    headers: {
      accept: "*/*",
      Authorization: `Bearer ${API_KEY}`,
    },
  });
  if (!indexRes.ok) throw new Error(`API ${indexRes.status}: ${await indexRes.text()}`);

  const indexPayload = await indexRes.json();
  const indexGroups = groupsFromPayload(indexPayload);
  const names = indexGroups
    .map((group) => groupName(group.name))
    .filter((name): name is string => name !== null);

  const apiGroups = await Promise.all(
    (names.length > 0 ? names : GROUP_NAMES).map(async (name) => {
      const res = await fetch(`${API_URL}/groups/${name}`, {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${API_KEY}`,
        },
      });
      if (!res.ok) throw new Error(`API ${res.status} for group ${name}: ${await res.text()}`);
      return (await res.json()) as ApiGroup;
    })
  );
  const synced_at = new Date().toISOString();

  const groups = apiGroups.flatMap((group) => {
    const name = groupName(group.name);
    if (!name) return [];
    return [{
      id: asNumber(group.id),
      name,
      synced_at,
    }];
  });

  const standings = apiGroups.flatMap((group) => {
    const name = groupName(group.name);
    if (!name || !Array.isArray(group.standings)) return [];

    return (group.standings as ApiStanding[]).flatMap((standing, index) => {
      const team_id = asNumber(standing.team_id, NaN);
      const team_name = asNullableString(standing.team_name);
      if (!Number.isFinite(team_id) || !team_name) return [];

      return [{
        group_name: groupName(standing.group_name) ?? name,
        team_id,
        team_name,
        team_code: asNullableString(standing.team_code),
        flag_url: asNullableString(standing.flag_url),
        played: asNumber(standing.played),
        won: asNumber(standing.won),
        drawn: asNumber(standing.drawn),
        lost: asNumber(standing.lost),
        goals_for: asNumber(standing.goals_for),
        goals_against: asNumber(standing.goals_against),
        goal_difference: asNumber(standing.goal_difference),
        points: asNumber(standing.points),
        position: index + 1,
        synced_at,
      }];
    });
  });

  if (groups.length === 0) {
    throw new Error("API returned no valid groups");
  }

  const { error: groupsError } = await sb.from("groups").upsert(groups, {
    onConflict: "id",
  });
  if (groupsError) throw groupsError;

  const { error: standingsError } = await sb.from("group_standings").upsert(standings, {
    onConflict: "group_name,team_id",
  });
  if (standingsError) throw standingsError;

  return {
    groups_synced: groups.length,
    standings_synced: standings.length,
  };
}

Deno.serve(async (req) => {
  if (req.headers.get("x-cron-secret") !== CRON_SECRET) {
    return new Response("forbidden", { status: 403 });
  }

  try {
    const result = await syncGroups();
    return Response.json(result);
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
});
