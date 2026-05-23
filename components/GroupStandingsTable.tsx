import { Flag, teamLabel } from "./flags";
import type { DbGroupStanding } from "@/lib/supabase/types";

type Props = {
  standings: DbGroupStanding[];
};

export function GroupStandingsTable({ standings }: Props) {
  if (standings.length === 0) return null;

  return (
    <div className="standings" aria-label="Clasificación del grupo">
      <div className="standings__row standings__row--head">
        <div className="standings__team">Equipo</div>
        <div>PTS</div>
        <div>PJ</div>
        <div>DG</div>
        <div>GF</div>
        <div>GC</div>
      </div>
      {standings.map((team) => (
        <div key={team.team_id} className="standings__row">
          <div className="standings__team">
            <span className="standings__flag">
              <Flag
                code={team.team_code}
                instanceKey={`standing-${team.group_name}-${team.team_id}`}
              />
            </span>
            <span className="standings__name">
              {teamLabel(team.team_code, team.team_name)}
            </span>
          </div>
          <div className="standings__pts">{team.points}</div>
          <div>{team.played}</div>
          <div>{team.goal_difference}</div>
          <div>{team.goals_for}</div>
          <div>{team.goals_against}</div>
        </div>
      ))}
    </div>
  );
}
