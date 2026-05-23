create or replace function public.is_admin() returns boolean
language sql security definer set search_path = public stable as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Enable test mode for a match: snapshot current row, set is_test=true. Idempotent.
create or replace function public.test_enable(p_match_id text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;

  insert into public.matches_test_snapshots
    (match_id, kickoff_utc, status, home_team, away_team,
     home_team_code, away_team_code, home_score, away_score, home_pen, away_pen)
  select id, kickoff_utc, status, home_team, away_team,
         home_team_code, away_team_code, home_score, away_score, home_pen, away_pen
    from public.matches where id = p_match_id
  on conflict (match_id) do nothing;

  update public.matches set is_test = true where id = p_match_id;
end;
$$;

-- Restore from snapshot, clear is_test, drop the snapshot row. Clears computed points.
create or replace function public.test_disable(p_match_id text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;

  update public.matches m
     set status = s.status,
         kickoff_utc = s.kickoff_utc,
         home_team = s.home_team, away_team = s.away_team,
         home_team_code = s.home_team_code, away_team_code = s.away_team_code,
         home_score = s.home_score, away_score = s.away_score,
         home_pen = s.home_pen, away_pen = s.away_pen,
         is_test = false
    from public.matches_test_snapshots s
   where m.id = p_match_id and s.match_id = p_match_id;

  update public.predictions set points = null where match_id = p_match_id;

  delete from public.matches_test_snapshots where match_id = p_match_id;
end;
$$;

-- Drive a test-mode match into a state.
--   p_status:                 'scheduled' | 'live' | 'completed'
--   p_kickoff_offset_minutes: how far in the past kickoff should sit (0 = no change to kickoff).
--                             Negative = kickoff in future (e.g. -60 = kickoff in 1 hour).
--                             Positive = kicked off N minutes ago (e.g. 30 = 30 min into the match).
--   scores/pens:              null = leave unchanged.
create or replace function public.test_set_state(
  p_match_id                text,
  p_status                  text,
  p_kickoff_offset_minutes  int default 0,
  p_home_score              int default null,
  p_away_score              int default null,
  p_home_pen                int default null,
  p_away_pen                int default null
) returns void
language plpgsql security definer set search_path = public as $$
declare
  in_test boolean;
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  select is_test into in_test from public.matches where id = p_match_id;
  if not coalesce(in_test, false) then
    raise exception 'match % is not in test mode; call test_enable first', p_match_id;
  end if;
  if p_status not in ('scheduled','live','completed') then
    raise exception 'invalid status %', p_status;
  end if;

  update public.matches
     set status      = p_status,
         kickoff_utc = case
           when p_kickoff_offset_minutes = 0 then kickoff_utc
           else now() - (p_kickoff_offset_minutes || ' minutes')::interval
         end,
         home_score = coalesce(p_home_score, home_score),
         away_score = coalesce(p_away_score, away_score),
         home_pen   = coalesce(p_home_pen,   home_pen),
         away_pen   = coalesce(p_away_pen,   away_pen)
   where id = p_match_id;
  -- on_match_completed trigger handles scoring when status flips to 'completed'.
end;
$$;

-- Helper for knockout matches whose teams are TBD in the API.
create or replace function public.test_set_knockout_teams(
  p_match_id       text,
  p_home_team      text,
  p_away_team      text,
  p_home_team_code text,
  p_away_team_code text
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  update public.matches
     set home_team = p_home_team, away_team = p_away_team,
         home_team_code = p_home_team_code, away_team_code = p_away_team_code
   where id = p_match_id and is_test = true;
end;
$$;

revoke all on function public.test_enable(text)            from public;
revoke all on function public.test_disable(text)           from public;
revoke all on function public.test_set_state(text,text,int,int,int,int,int) from public;
revoke all on function public.test_set_knockout_teams(text,text,text,text,text) from public;

grant execute on function public.test_enable(text)            to authenticated;
grant execute on function public.test_disable(text)           to authenticated;
grant execute on function public.test_set_state(text,text,int,int,int,int,int) to authenticated;
grant execute on function public.test_set_knockout_teams(text,text,text,text,text) to authenticated;;
