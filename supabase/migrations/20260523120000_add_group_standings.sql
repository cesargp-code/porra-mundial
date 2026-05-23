create table if not exists public.groups (
  id integer primary key,
  name text not null unique,
  synced_at timestamptz not null default now(),
  constraint groups_name_check check (name ~ '^[A-L]$')
);

create table if not exists public.group_standings (
  group_name text not null references public.groups(name) on update cascade on delete cascade,
  team_id integer not null,
  team_name text not null,
  team_code text,
  flag_url text,
  played integer not null default 0,
  won integer not null default 0,
  drawn integer not null default 0,
  lost integer not null default 0,
  goals_for integer not null default 0,
  goals_against integer not null default 0,
  goal_difference integer not null default 0,
  points integer not null default 0,
  position integer not null,
  synced_at timestamptz not null default now(),
  primary key (group_name, team_id),
  constraint group_standings_group_name_check check (group_name ~ '^[A-L]$'),
  constraint group_standings_nonnegative_check check (
    played >= 0
    and won >= 0
    and drawn >= 0
    and lost >= 0
    and goals_for >= 0
    and goals_against >= 0
    and points >= 0
    and position > 0
  )
);

create index if not exists group_standings_group_position_idx
  on public.group_standings (group_name, position);

alter table public.groups enable row level security;
alter table public.group_standings enable row level security;

drop policy if exists "Authenticated users can read groups" on public.groups;
create policy "Authenticated users can read groups"
  on public.groups
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can read group standings" on public.group_standings;
create policy "Authenticated users can read group standings"
  on public.group_standings
  for select
  to authenticated
  using (true);

grant usage on schema public to authenticated, service_role;
grant select on public.groups to authenticated;
grant select on public.group_standings to authenticated;
grant select, insert, update, delete on public.groups to service_role;
grant select, insert, update, delete on public.group_standings to service_role;
