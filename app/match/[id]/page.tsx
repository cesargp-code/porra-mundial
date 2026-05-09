import { notFound } from "next/navigation";

import { DetailTopbar } from "@/components/MatchDetail/DetailTopbar";
import { Hero } from "@/components/MatchDetail/Hero";
import {
  GROUP,
  PLAYS_FINISHED,
  PLAYS_LIVE,
  PLAYS_UPCOMING,
  type DetailState,
  type FinishedOrLivePlay,
  type UpcomingPlay,
} from "@/components/MatchDetail/placeholderPlayers";
import { PlayerRow } from "@/components/MatchDetail/PlayerRow";
import { venueLabel, whenLabel } from "@/lib/format";
import { toUiMatch } from "@/lib/matches";
import { getMatchById } from "@/lib/supabase/server";

export const revalidate = 60;

// Dev-only canonical scores so a forced state has something to render against
// the placeholder plays. Match the design fixtures so PLAYS_*.exact rows light up.
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
  const row = await getMatchById(id);
  if (!row) notFound();
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

  const scoredPlays =
    detailState === "finished"
      ? PLAYS_FINISHED
      : detailState === "live"
        ? PLAYS_LIVE
        : null;

  const playFor = (playerId: string): FinishedOrLivePlay | UpcomingPlay | undefined =>
    scoredPlays ? scoredPlays[playerId] : PLAYS_UPCOMING[playerId];

  const sortedPlayers = [...GROUP].sort((a, b) => {
    if (scoredPlays) {
      return (scoredPlays[b.id]?.points ?? 0) - (scoredPlays[a.id]?.points ?? 0);
    }
    const ra = PLAYS_UPCOMING[a.id]?.ready ? 0 : 1;
    const rb = PLAYS_UPCOMING[b.id]?.ready ? 0 : 1;
    return ra - rb;
  });

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
        <div className="hero__divider" />
        <div className="players players--embedded">
          {sortedPlayers.map((p) => (
            <PlayerRow
              key={p.id}
              player={p}
              state={detailState}
              play={playFor(p.id)}
              realScore={realScore}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
