"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

function revalidateMatch(matchId: string) {
  revalidatePath("/admin/test");
  revalidatePath("/");
  revalidatePath("/me");
  revalidatePath(`/match/${matchId}`);
}

function num(fd: FormData, key: string): number | null {
  const raw = fd.get(key);
  if (raw === null || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function str(fd: FormData, key: string): string {
  const raw = fd.get(key);
  if (typeof raw !== "string" || raw.length === 0) {
    throw new Error(`missing field: ${key}`);
  }
  return raw;
}

export async function enableTestModeAction(fd: FormData) {
  const matchId = str(fd, "matchId");
  const supabase = await createClient();
  const { error } = await supabase.rpc("test_enable", { p_match_id: matchId });
  if (error) throw new Error(error.message);
  revalidateMatch(matchId);
}

export async function disableTestModeAction(fd: FormData) {
  const matchId = str(fd, "matchId");
  const supabase = await createClient();
  const { error } = await supabase.rpc("test_disable", { p_match_id: matchId });
  if (error) throw new Error(error.message);
  revalidateMatch(matchId);
}

export async function setMatchStateAction(fd: FormData) {
  const matchId = str(fd, "matchId");
  const status = str(fd, "status") as "scheduled" | "live" | "completed";
  const kickoffOffsetMin = num(fd, "kickoffOffsetMin") ?? 0;

  const supabase = await createClient();
  const { error } = await supabase.rpc("test_set_state", {
    p_match_id: matchId,
    p_status: status,
    p_kickoff_offset_minutes: kickoffOffsetMin,
    p_home_score: num(fd, "homeScore"),
    p_away_score: num(fd, "awayScore"),
    p_home_pen: num(fd, "homePen"),
    p_away_pen: num(fd, "awayPen"),
  });
  if (error) throw new Error(error.message);
  revalidateMatch(matchId);
}

export async function setKnockoutTeamsAction(fd: FormData) {
  const matchId = str(fd, "matchId");
  const supabase = await createClient();
  const { error } = await supabase.rpc("test_set_knockout_teams", {
    p_match_id: matchId,
    p_home_team: str(fd, "homeTeam"),
    p_away_team: str(fd, "awayTeam"),
    p_home_team_code: str(fd, "homeCode"),
    p_away_team_code: str(fd, "awayCode"),
  });
  if (error) throw new Error(error.message);
  revalidateMatch(matchId);
}
