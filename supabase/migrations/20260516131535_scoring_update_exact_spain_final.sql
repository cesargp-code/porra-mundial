CREATE OR REPLACE FUNCTION public.compute_points(
  p_round text,
  p_home_score integer,
  p_away_score integer,
  p_home_pen integer,
  p_away_pen integer,
  p_pred_home integer,
  p_pred_away integer,
  p_pred_pen_winner text,
  p_home_team text,
  p_away_team text
) RETURNS integer
  LANGUAGE plpgsql
  IMMUTABLE
AS $function$
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

  -- Score tiers
  if p_pred_home = p_home_score and p_pred_away = p_away_score then
    base := 7;                            -- exact score
  elsif real_res = pred_res then
    if real_gd = pred_gd then
      base := 4;                          -- correct result + exact GD
    elsif abs(pred_gd - real_gd) = 1 then
      base := 3;                          -- correct result, GD off by 1
    else
      base := 2;                          -- correct result, GD off >= 2
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
    when 'final' then 15
    else 1
  end;

  -- Spain bonus: any match featuring Spain doubles the round multiplier
  if 'Spain' in (p_home_team, p_away_team) then
    multiplier := multiplier * 2;
  end if;

  return (base + pen_bonus) * multiplier;
end;
$function$;;
