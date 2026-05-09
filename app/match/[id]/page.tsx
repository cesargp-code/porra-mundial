import { notFound, redirect } from "next/navigation";

import { DetailTopbar } from "@/components/MatchDetail/DetailTopbar";
import { Hero } from "@/components/MatchDetail/Hero";
import { PlayerRow } from "@/components/MatchDetail/PlayerRow";
import { PredictRegion } from "@/components/MatchDetail/PredictRegion";
import type {
  DetailState,
  FinishedOrLivePlay,
  Player,
  UpcomingPlay,
} from "@/components/MatchDetail/types";
import { venueLabel, whenLabel } from "@/lib/format";
import { toUiMatch } from "@/lib/matches";
import {
  getCurrentUserId,
  getMatchById,
  getMyPredictionForMatch,
  getPredictionsForMatch,
  getPredictorIdsForMatch,
  getProfiles,
} from "@/lib/supabase/server";

export const revalidate = 60;

// Dev-only canonical scores so a forced state has something to render against.
const DEV_SCORES: Record<"finished" | "live", { home: number; away: number }> = {
  finished: { home: 3, away: 1 },
  live: { home: 2, away: 0 },
};

function parseStateOverride(value: unknown): DetailState | null {
  if (process.env.NODE_ENV === "production") return null;
  if (value === "finished" || value === "live" || value === "upcoming") return value;
  return null;
}

export default async function MatchDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ state?: string }>;
}) {
  const [{ id }, { state: stateParam }] = await Promise.all([params, searchParams]);

  const [row, currentUserId, profiles] = await Promise.all([
    getMatchById(id),
    getCurrentUserId(),
    getProfiles(),
  ]);
  if (!row) notFound();
  if (!currentUserId) redirect("/login");
  const match = toUiMatch(row);
  if (match.state === "locked") notFound();

  const override = parseStateOverride(stateParam);
  const detailState: DetailState =
    override ??
    (match.state === "finished" ? "finished" : match.state === "live" ? "live" : "upcoming");

  const homeScore =
    override && override !== "upcoming" && match.homeScore === null
      ? DEV_SCORES[override].home
      : match.homeScore;
  const awayScore =
    override && override !== "upcoming" && match.awayScore === null
      ? DEV_SCORES[override].away
      : match.awayScore;

  const realScore =
    detailState !== "upcoming" && homeScore !== null && awayScore !== null
      ? { home: homeScore, away: awayScore }
      : null;

  const players: Player[] = profiles.map((p) => ({
    id: p.id,
    name: p.nickname,
    you: p.id === currentUserId,
  }));

  let scoredPlays: Record<string, FinishedOrLivePlay> | null = null;
  let upcomingPlays: Record<string, UpcomingPlay> | null = null;
  let myPrediction: { home: number; away: number } | null = null;

  if (detailState === "upcoming") {
    const [predictorIds, mine] = await Promise.all([
      getPredictorIdsForMatch(id),
      getMyPredictionForMatch(id, currentUserId),
    ]);
    const ready = new Set(predictorIds);
    upcomingPlays = Object.fromEntries(
      players.map((p) => [p.id, { ready: ready.has(p.id) }])
    );
    if (mine) myPrediction = { home: mine.home_score, away: mine.away_score };
  } else {
    const predictions = await getPredictionsForMatch(id);
    scoredPlays = Object.fromEntries(
      predictions.map((p) => [
        p.user_id,
        {
          guess: { home: p.home_score, away: p.away_score },
          points: p.points ?? 0,
        },
      ])
    );
    const mine = predictions.find((p) => p.user_id === currentUserId);
    if (mine) myPrediction = { home: mine.home_score, away: mine.away_score };
  }

  const playFor = (playerId: string): FinishedOrLivePlay | UpcomingPlay | undefined =>
    scoredPlays ? scoredPlays[playerId] : upcomingPlays?.[playerId];

  const sortedPlayers = [...players].sort((a, b) => {
    if (scoredPlays) {
      // In live/finished: only show players who actually predicted; sort by points desc.
      const ap = scoredPlays[a.id];
      const bp = scoredPlays[b.id];
      if (!ap && !bp) return 0;
      if (!ap) return 1;
      if (!bp) return -1;
      return bp.points - ap.points;
    }
    const ra = upcomingPlays?.[a.id]?.ready ? 0 : 1;
    const rb = upcomingPlays?.[b.id]?.ready ? 0 : 1;
    return ra - rb;
  });

  const visiblePlayers = scoredPlays
    ? sortedPlayers.filter((p) => scoredPlays?.[p.id])
    : sortedPlayers;

  return (
    <div className="screen" data-screen-label={`Detail · ${detailState}`}>
      <DetailTopbar
        when={whenLabel(match.kickoff)}
        where={venueLabel(match.stadium, match.stadiumCity)}
      />

      <div className={`hero hero--${detailState}`}>
        <Hero
          matchId={match.id}
          state={detailState}
          homeCode={match.homeCode}
          awayCode={match.awayCode}
          homeName={match.homeName}
          awayName={match.awayName}
          homeScore={homeScore}
          awayScore={awayScore}
        />
        {detailState === "upcoming" ? (
          <PredictRegion matchId={match.id} initial={myPrediction}>
            <div className="hero__divider" />
            <div className="players players--embedded">
              {visiblePlayers.map((p) => (
                <PlayerRow
                  key={p.id}
                  player={p}
                  state={detailState}
                  play={playFor(p.id)}
                  realScore={realScore}
                />
              ))}
            </div>
          </PredictRegion>
        ) : (
          <>
            <div className="hero__divider" />
            <div className="players players--embedded">
              {visiblePlayers.map((p) => (
                <PlayerRow
                  key={p.id}
                  player={p}
                  state={detailState}
                  play={playFor(p.id)}
                  realScore={realScore}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
