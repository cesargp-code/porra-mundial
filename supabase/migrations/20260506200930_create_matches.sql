
create table public.matches (
  id text primary key,
  match_number int not null,
  round text not null,
  group_name text,
  home_team text,
  away_team text,
  home_team_code text,
  away_team_code text,
  stadium text,
  stadium_city text,
  kickoff_utc timestamptz not null,
  home_score int,
  away_score int,
  home_pen int,
  away_pen int,
  status text not null default 'scheduled',
  synced_at timestamptz not null default now()
);

alter table public.matches enable row level security;

create policy "matches_select" on public.matches
  for select to authenticated using (true);
;
