import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { DbMatch, DbPrediction, DbProfile } from "./types";

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — middleware will refresh the session.
          }
        },
      },
    }
  );
}

export async function getMatches(): Promise<DbMatch[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .order("kickoff_utc", { ascending: true });

  if (error) throw new Error(`Failed to load matches: ${error.message}`);
  return (data ?? []) as DbMatch[];
}

export async function getMatchById(id: string): Promise<DbMatch | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load match ${id}: ${error.message}`);
  return (data as DbMatch | null) ?? null;
}

export async function getProfiles(): Promise<DbProfile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Failed to load profiles: ${error.message}`);
  return (data ?? []) as DbProfile[];
}

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function getPredictionsForMatch(matchId: string): Promise<DbPrediction[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("predictions")
    .select("*")
    .eq("match_id", matchId);

  if (error) throw new Error(`Failed to load predictions: ${error.message}`);
  return (data ?? []) as DbPrediction[];
}

export async function getMyPredictionForMatch(
  matchId: string,
  userId: string
): Promise<DbPrediction | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("predictions")
    .select("*")
    .eq("match_id", matchId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(`Failed to load own prediction: ${error.message}`);
  return (data as DbPrediction | null) ?? null;
}

export async function getPredictorIdsForMatch(matchId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("predictor_ids_for_match", {
    p_match_id: matchId,
  });

  if (error) throw new Error(`Failed to load predictor ids: ${error.message}`);
  return ((data ?? []) as string[]).map(String);
}

export async function getPredictorCounts(): Promise<Map<string, number>> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("predictor_counts");

  if (error) throw new Error(`Failed to load predictor counts: ${error.message}`);
  const rows = (data ?? []) as { match_id: string; n: number }[];
  return new Map(rows.map((r) => [r.match_id, r.n]));
}

export async function getMyPredictions(userId: string): Promise<DbPrediction[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("predictions")
    .select("*")
    .eq("user_id", userId);

  if (error) throw new Error(`Failed to load own predictions: ${error.message}`);
  return (data ?? []) as DbPrediction[];
}
