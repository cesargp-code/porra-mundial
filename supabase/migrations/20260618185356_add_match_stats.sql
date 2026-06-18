create table if not exists public.match_stats (
  match_id text primary key references public.matches(id) on delete cascade,
  stats jsonb,
  timeline jsonb,
  source_fetched_at timestamptz,
  last_attempted_at timestamptz,
  last_error text,
  synced_at timestamptz not null default now()
);

alter table public.match_stats enable row level security;

drop policy if exists match_stats_select on public.match_stats;
create policy match_stats_select on public.match_stats
  for select to anon, authenticated using (true);

grant select on public.match_stats to anon, authenticated;
