create or replace function public.any_match_active_now(
  p_pre_min   int,
  p_post_min  int,
  p_group_dur int,
  p_ko_dur    int
) returns boolean
language sql stable as $$
  select exists (
    select 1 from public.matches
    where now() between
      kickoff_utc - make_interval(mins => p_pre_min)
      and kickoff_utc + make_interval(
        mins => p_post_min + case when round = 'group' then p_group_dur else p_ko_dur end
      )
  );
$$;
revoke all on function public.any_match_active_now(int,int,int,int) from public;
grant execute on function public.any_match_active_now(int,int,int,int) to service_role;;
