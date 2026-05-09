"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type SavePredictionResult = { ok: true } | { ok: false; error: string };

export async function savePrediction(
  matchId: string,
  homeScore: number,
  awayScore: number,
  penaltyWinner: string | null = null
): Promise<SavePredictionResult> {
  if (
    !Number.isInteger(homeScore) ||
    !Number.isInteger(awayScore) ||
    homeScore < 0 ||
    awayScore < 0 ||
    homeScore > 20 ||
    awayScore > 20
  ) {
    return { ok: false, error: "Resultado inválido." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión expirada." };

  const { error } = await supabase.from("predictions").upsert(
    {
      user_id: user.id,
      match_id: matchId,
      home_score: homeScore,
      away_score: awayScore,
      penalty_winner: penaltyWinner,
    },
    { onConflict: "user_id,match_id" }
  );

  if (error) {
    if (error.code === "42501" || /row-level security/i.test(error.message)) {
      return { ok: false, error: "El partido ya ha empezado." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath(`/match/${matchId}`);
  revalidatePath("/");
  return { ok: true };
}
