import { createClient } from "@supabase/supabase-js";

import type { DbMatch } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY in environment."
  );
}

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});

export async function getMatches(): Promise<DbMatch[]> {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .order("kickoff_utc", { ascending: true });

  if (error) throw new Error(`Failed to load matches: ${error.message}`);
  return (data ?? []) as DbMatch[];
}

export async function getMatchById(id: string): Promise<DbMatch | null> {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load match ${id}: ${error.message}`);
  return (data as DbMatch | null) ?? null;
}
