
create table public.predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  match_id text not null references public.matches(id) on delete cascade,
  home_score int not null,
  away_score int not null,
  penalty_winner text,
  points int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, match_id)
);

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_prediction_updated
  before update on public.predictions
  for each row execute procedure public.handle_updated_at();

alter table public.predictions enable row level security;

create policy "predictions_select" on public.predictions
  for select to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.matches m
      where m.id = match_id and m.kickoff_utc <= now()
    )
  );

create policy "predictions_insert" on public.predictions
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.matches m
      where m.id = match_id and m.kickoff_utc > now()
    )
  );

create policy "predictions_update" on public.predictions
  for update to authenticated
  using (
    user_id = auth.uid()
    and exists (
      select 1 from public.matches m
      where m.id = match_id and m.kickoff_utc > now()
    )
  );
;
