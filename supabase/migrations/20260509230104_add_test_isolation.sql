-- Admin flag on profiles (grant admins manually in Supabase)
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- Per-row isolation flag on matches
alter table public.matches
  add column if not exists is_test boolean not null default false;

create index if not exists matches_is_test_idx on public.matches(is_test) where is_test;

-- Snapshot of the original row for any match we toggle into test mode
create table if not exists public.matches_test_snapshots (
  match_id text primary key references public.matches(id) on delete cascade,
  kickoff_utc timestamptz not null,
  status text not null,
  home_team text,
  away_team text,
  home_team_code text,
  away_team_code text,
  home_score int,
  away_score int,
  home_pen int,
  away_pen int,
  created_at timestamptz not null default now()
);

alter table public.matches_test_snapshots enable row level security;
-- No RLS policies: only callable through SECURITY DEFINER RPCs.
