
-- Compute points for one prediction given a completed match.
-- Returns NULL if the match has no final score.
create or replace function public.compute_points(
  p_round           text,
  p_home_score      int,
  p_away_score      int,
  p_home_pen        int,
  p_away_pen        int,
  p_pred_home       int,
  p_pred_away       int,
  p_pred_pen_winner text,
  p_home_team       text,
  p_away_team       text
) returns int
language plpgsql immutable as $$
declare
  base       int := 0;
  pen_bonus  int := 0;
  multiplier int;
  real_gd    int;
  pred_gd    int;
  real_res   text;
  pred_res   text;
  pen_winner text;
begin
  if p_home_score is null or p_away_score is null then
    return null;
  end if;

  real_gd := p_home_score - p_away_score;
  pred_gd := p_pred_home - p_pred_away;
  real_res := case when real_gd > 0 then 'H' when real_gd < 0 then 'A' else 'D' end;
  pred_res := case when pred_gd > 0 then 'H' when pred_gd < 0 then 'A' else 'D' end;

  -- Score tiers (CLAUDE.md)
  if p_pred_home = p_home_score and p_pred_away = p_away_score then
    base := 5;                            -- exact score
  elsif real_res = pred_res then
    if real_gd = pred_gd then
      base := 4;                          -- correct result + exact GD
    elsif abs(pred_gd - real_gd) = 1 then
      base := 3;                          -- correct result, GD off by 1
    else
      base := 2;                          -- correct result, GD off ≥ 2
    end if;
  end if;

  -- Penalty bonus only when match actually went to pens
  if p_home_pen is not null and p_away_pen is not null then
    pen_winner := case when p_home_pen > p_away_pen then p_home_team else p_away_team end;
    if p_pred_pen_winner is not null and p_pred_pen_winner = pen_winner then
      pen_bonus := 2;
    end if;
  end if;

  multiplier := case p_round
    when 'group' then 1
    when 'R32'   then 3
    when 'R16'   then 5
    when 'QF'    then 8
    when 'SF'    then 12
    when '3rd'   then 6
    when 'final' then 1   -- TBD per spec; update before the final
    else 1
  end;

  return (base + pen_bonus) * multiplier;
end;
$$;

-- Trigger: when a match flips to completed (or its final score is corrected),
-- recompute points for every prediction on that match.
create or replace function public.score_predictions_on_match_complete()
returns trigger language plpgsql as $$
begin
  if new.status = 'completed' and (
       old.status     is distinct from 'completed'
    or old.home_score is distinct from new.home_score
    or old.away_score is distinct from new.away_score
    or old.home_pen   is distinct from new.home_pen
    or old.away_pen   is distinct from new.away_pen
  ) then
    update public.predictions p
       set points = public.compute_points(
         new.round,
         new.home_score, new.away_score,
         new.home_pen,   new.away_pen,
         p.home_score,   p.away_score, p.penalty_winner,
         new.home_team,  new.away_team
       )
     where p.match_id = new.id;
  end if;
  return new;
end;
$$;

create trigger on_match_completed
  after update on public.matches
  for each row
  execute function public.score_predictions_on_match_complete();
;
