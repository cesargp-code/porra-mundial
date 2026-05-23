import Link from "next/link";
import { redirect } from "next/navigation";

import { DayHeader } from "@/components/DayHeader";
import { MatchCard } from "@/components/MatchCard";
import { SegmentedTabs } from "@/components/SegmentedTabs";
import {
  groupByDay,
  groupByTournamentGroup,
  toUiMatch,
  type MatchListContext,
} from "@/lib/matches";
import {
  getCurrentUserId,
  getMatches,
  getMyPredictions,
  getPredictorCounts,
  getProfiles,
} from "@/lib/supabase/server";

export const revalidate = 60;

export default async function MatchListPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const [rows, profiles, myPredictions, predictorCounts] = await Promise.all([
    getMatches(),
    getProfiles(),
    getMyPredictions(userId),
    getPredictorCounts(),
  ]);

  const ctx: MatchListContext = {
    myPredictions: new Map(myPredictions.map((p) => [p.match_id, p])),
    predictorCounts,
    totalPlayers: profiles.length,
  };

  const matches = rows.map((r) => toUiMatch(r, ctx));
  const groups = groupByDay(matches);
  const tournamentGroups = groupByTournamentGroup(matches);

  const totalPoints = myPredictions.reduce((sum, p) => sum + (p.points ?? 0), 0);
  const rank = 1; // leaderboard not implemented yet

  return (
    <div className="screen" data-screen-label="01 Match List">
      <SegmentedTabs
        ariaLabel="Vista de partidos"
        leftLabel="Por fecha"
        rightLabel="Por grupos"
        defaultTab="left"
        headerContent={
          <div className="appbar__row">
            <div className="appbar__title">
              Porra Mundial
              <small>2026 · Poligoneros</small>
            </div>
            <Link
              href="/me"
              className="rank-link"
              aria-label={`Fan Zone — vas ${rank}º con ${totalPoints} puntos`}
            >
              <span className="rank-link__pos"><b>{rank}º</b></span>
              <span className="rank-link__sep" aria-hidden="true" />
              <span className="rank-link__pts"><b>{totalPoints}</b> pts</span>
              <span className="rank-link__chev" aria-hidden="true">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 6 15 12 9 18" />
                </svg>
              </span>
            </Link>
          </div>
        }
        preserveSticky
        leftContent={
          <>
            {groups.map((g) => (
              <section key={g.key} className="day-group">
                <DayHeader label={g.label} count={g.items.length} />
                <div className="list">
                  {g.items.map((m) => (
                    <MatchCard key={m.id} match={m} />
                  ))}
                </div>
              </section>
            ))}

            <div className="list-end">FIN DE LA LISTA</div>
          </>
        }
        rightContent={
          <>
            {tournamentGroups.map((g) => (
              <section key={g.key} className="day-group">
                <DayHeader label={g.label} count={g.items.length} />
                <div className="list">
                  {g.items.map((m) => (
                    <MatchCard key={m.id} match={m} />
                  ))}
                </div>
              </section>
            ))}

            <div className="list-end">FIN DE LA LISTA</div>
          </>
        }
      />
    </div>
  );
}
