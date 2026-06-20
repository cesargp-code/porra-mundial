import Link from "next/link";
import { redirect } from "next/navigation";

import { DayHeader } from "@/components/DayHeader";
import { GroupStandingsTable } from "@/components/GroupStandingsTable";
import { MatchCard } from "@/components/MatchCard";
import { MatchListScrollRestoration } from "@/components/MatchListScrollRestoration";
import { MatchAutoRefresh } from "@/components/MatchAutoRefresh";
import { SegmentedTabs } from "@/components/SegmentedTabs";
import { calculateGroupStandings } from "@/lib/groupStandings";
import { dayKey } from "@/lib/format";
import {
  groupByDay,
  groupByTournamentGroup,
  toUiMatch,
  type MatchListContext,
} from "@/lib/matches";
import { rankPlayers } from "@/lib/ranking";
import {
  getCurrentUserId,
  getGroupStandings,
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
    groupStandings,
    pointsByUser,
  ] = await Promise.all([
    getMatches(),
    getProfiles(),
    getMyPredictions(userId),
    getPredictorCounts(),
    getGroupStandings(),
    getPointsByUser(),
  ]);

  const ctx: MatchListContext = {
    myPredictions: new Map(myPredictions.map((p) => [p.match_id, p])),
    predictorCounts,
    totalPlayers: profiles.length,
  };

  const matches = rows.map((r) => toUiMatch(r, ctx));
  const nextKickoff = matches.find((match) => match.kickoff.getTime() > Date.now())?.kickoff;
  const groups = groupByDay(matches);
  const todayKey = dayKey(new Date());
  const entryDayKey =
    view === "groups" ? undefined : groups.find((group) => group.key >= todayKey)?.key;
  const tournamentGroups = groupByTournamentGroup(matches);
  const standingsByGroup = new Map<string, typeof groupStandings>();
  for (const standing of groupStandings) {
    const key = standing.group_name.replace(/^group\s+/i, "").trim().toUpperCase();
    standingsByGroup.set(key, [...(standingsByGroup.get(key) ?? []), standing]);
  }

  const ranked = rankPlayers(profiles, pointsByUser);
  const currentPlayer = ranked.find((player) => player.id === userId);
  const totalPoints = currentPlayer?.points ?? 0;
  const rank = currentPlayer?.rank ?? ranked.length + 1;

  return (
    <div className="screen" data-screen-label="01 Match List">
      <MatchListScrollRestoration targetDayKey={entryDayKey} />
      <MatchAutoRefresh kickoff={nextKickoff?.toISOString()} />
      <SegmentedTabs
        ariaLabel="Vista de partidos"
        leftLabel="Por fecha"
        rightLabel="Por grupos"
        defaultTab={view === "groups" ? "right" : "left"}
        queryParam="view"
        leftQueryValue="date"
        rightQueryValue="groups"
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
          <>
            {tournamentGroups.map((g) => (
              <section key={g.key} className="day-group">
                <DayHeader label={g.label} />
                <GroupStandingsTable
                  standings={calculateGroupStandings(
                    standingsByGroup.get(g.key) ?? [],
                    g.items
                  )}
                />
                <div className="list">
                  {g.items.map((m) => (
                    <MatchCard key={m.id} match={m} timeFormat="compact-date-time" />
                  ))}
                </div>
              </section>
            ))}

          </>
        }
      />
    </div>
  );
}
