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
  phase: string | null;
  match_minute: number | null;
  status: MatchStatus;
  synced_at: string;
  is_test: boolean;
};

export type DbProfile = {
  id: string;
  nickname: string;
  created_at: string;
  is_admin: boolean;
};

export type DbPrediction = {
  id: string;
  user_id: string;
  match_id: string;
  home_score: number;
  away_score: number;
  penalty_winner: string | null;
  points: number | null;
  created_at: string;
  updated_at: string;
};

export type DbMatchStats = {
  match_id: string;
  stats: Record<string, unknown> | null;
  timeline: unknown[] | null;
  source_fetched_at: string | null;
  last_attempted_at: string | null;
  last_error: string | null;
  synced_at: string;
};

export type DbGroup = {
  id: number;
  name: string;
  synced_at: string;
};

export type DbGroupStanding = {
  group_name: string;
  team_id: number;
  team_name: string;
  team_code: string | null;
  flag_url: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  position: number;
  synced_at: string;
};
