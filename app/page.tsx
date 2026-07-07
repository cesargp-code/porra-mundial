import Link from "next/link";
import { redirect } from "next/navigation";

import { BracketView } from "@/components/BracketView";
import { DayHeader } from "@/components/DayHeader";
import { MatchCard } from "@/components/MatchCard";
import { MatchListScrollRestoration } from "@/components/MatchListScrollRestoration";
import { MatchAutoRefresh } from "@/components/MatchAutoRefresh";
import { SegmentedTabs } from "@/components/SegmentedTabs";
import { dayKey } from "@/lib/format";
import { getNextMatchRefreshAt } from "@/lib/matchRefreshPolicy";
import {
  groupByBracketRound,
  groupByDay,
  toUiMatch,
  type MatchListContext,
} from "@/lib/matches";
import { rankPlayers } from "@/lib/ranking";
import {
  getCurrentUserId,
  getMatches,
  getMyPredictions,
  getPointsByUser,
  getPredictorCounts,
  getProfiles,
} from "@/lib/supabase/server";

export const revalidate = 60;

export default async function MatchListPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const [
    rows,
    profiles,
    myPredictions,
    predictorCounts,
    pointsByUser,
  ] = await Promise.all([
    getMatches(),
    getProfiles(),
    getMyPredictions(userId),
    getPredictorCounts(),
    getPointsByUser(),
  ]);

  const ctx: MatchListContext = {
    myPredictions: new Map(myPredictions.map((p) => [p.match_id, p])),
    predictorCounts,
    totalPlayers: profiles.length,
  };

  const matches = rows.map((r) => toUiMatch(r, ctx));
  const nextRefreshAt = getNextMatchRefreshAt(rows);
  const groups = groupByDay(matches);
  const todayKey = dayKey(new Date());
  const locatorDayKey = groups.find((group) => group.key >= todayKey)?.key;
  const entryDayKey =
    view === undefined ? locatorDayKey : undefined;
  const bracketRounds = groupByBracketRound(matches);

  const ranked = rankPlayers(profiles, pointsByUser);
  const currentPlayer = ranked.find((player) => player.id === userId);
  const totalPoints = currentPlayer?.points ?? 0;
  const rank = currentPlayer?.rank ?? ranked.length + 1;

  return (
    <div className="screen" data-screen-label="01 Match List">
      <MatchListScrollRestoration targetDayKey={entryDayKey} />
      <MatchAutoRefresh refreshAfter={nextRefreshAt} />
      <SegmentedTabs
        ariaLabel="Vista de partidos"
        leftLabel="Por fecha"
        rightLabel="Por cruces"
        defaultTab={view === "bracket" || view === "groups" ? "right" : "left"}
        queryParam="view"
        leftQueryValue="date"
        rightQueryValue="bracket"
        leftLocatorDayKey={locatorDayKey}
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
              <section key={g.key} className="day-group" data-day-key={g.key}>
                <DayHeader label={g.label} count={g.items.length} />
                <div className="list">
                  {g.items.map((m) => (
                    <MatchCard key={m.id} match={m} />
                  ))}
                </div>
              </section>
            ))}

          </>
        }
        rightContent={
          <BracketView rounds={bracketRounds} />
        }
      />
    </div>
  );
}
