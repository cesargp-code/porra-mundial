create or replace function public.predictor_ids_for_match(p_match_id text)
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select user_id from predictions where match_id = p_match_id;
$$;

revoke all on function public.predictor_ids_for_match(text) from public;
grant execute on function public.predictor_ids_for_match(text) to authenticated;;
