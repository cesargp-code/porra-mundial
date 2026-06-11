import type { MatchStatus } from "./supabase/types";

export function isMatchActive(
  match: { kickoff_utc: string; status: MatchStatus },
  now = Date.now()
) {
  return match.status !== "completed" && now >= new Date(match.kickoff_utc).getTime();
}
