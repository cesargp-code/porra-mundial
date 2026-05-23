create or replace function public.predictor_counts()
returns table (match_id text, n integer)
language sql
security definer
set search_path = public
stable
as $$
  select match_id, count(*)::int as n
  from predictions
  group by match_id;
$$;

revoke all on function public.predictor_counts() from public;
grant execute on function public.predictor_counts() to authenticated;;
