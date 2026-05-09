export type MatchStatus = "scheduled" | "live" | "completed";

export type DbMatch = {
  id: string;
  match_number: number;
  round: string;
  group_name: string | null;
  home_team: string | null;
  away_team: string | null;
  home_team_code: string | null;
  away_team_code: string | null;
  stadium: string | null;
  stadium_city: string | null;
  kickoff_utc: string;
  home_score: number | null;
  away_score: number | null;
  home_pen: number | null;
  away_pen: number | null;
  status: MatchStatus;
  synced_at: string;
};
