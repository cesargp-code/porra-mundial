"use client";

import Link from "next/link";
import type { MouseEvent } from "react";

import { Flag, teamLabel } from "./flags";
import { GroupPressure } from "./GroupPressure";
import { PointsLine } from "./PointsLine";
import { StatusPill } from "./StatusPill";
import { compactDateTimeLabel, timeLabel } from "@/lib/format";
import { MATCH_LIST_RETURN_KEY } from "@/lib/matchListNavigation";
import type { UiMatch } from "@/lib/matches";
import { getMatchMultiplier } from "@/lib/scoring";

type MatchCardTimeFormat = "time" | "compact-date-time";

export function MatchCard({
  match,
  timeFormat = "time",
}: {
  match: UiMatch;
  timeFormat?: MatchCardTimeFormat;
}) {
  const { state, homeCode, awayCode, homeName, awayName, homeScore, awayScore } = match;
  const kickoffLabel =
    timeFormat === "compact-date-time"
      ? compactDateTimeLabel(match.kickoff)
      : timeLabel(match.kickoff);
  const showScore =
    (state === "finished" || state === "live") && homeScore !== null && awayScore !== null;
  const homeWin = showScore && (homeScore as number) > (awayScore as number);
  const awayWin = showScore && (awayScore as number) > (homeScore as number);
  const multiplierDetails = getMatchMultiplier({
    round: match.round,
    homeTeam: match.homeName,
    awayTeam: match.awayName,
  });
  const showMultiplier = multiplierDetails.multiplier > 1;
  const className = `card card--compact card--${state}${
    showMultiplier ? " card--multiplier" : ""
  }`;
  const multiplierLabel = `${multiplierDetails.roundLabel}${
    multiplierDetails.hasSpain ? " + España" : ""
  }`;

  function rememberListPosition(event: MouseEvent<HTMLAnchorElement>) {
    try {
      sessionStorage.setItem(
        MATCH_LIST_RETURN_KEY,
        JSON.stringify({
          listUrl: `${window.location.pathname}${window.location.search}`,
          matchId: match.id,
          scrollY: window.scrollY,
          viewportTop: event.currentTarget.getBoundingClientRect().top,
        }),
      );
    } catch {
      // History restoration remains available when storage is unavailable.
    }
  }

  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    state === "locked" ? (
      <article className={className} aria-disabled="true">
        {children}
      </article>
    ) : (
      <Link
        href={`/match/${match.id}?from=list`}
        className={className}
        data-match-id={match.id}
        onClick={rememberListPosition}
      >
        {children}
      </Link>
    );

  return (
    <Wrapper>
      {showMultiplier && (
        <span
          className="compact__multiplier"
          aria-label={`Multiplicador x${multiplierDetails.multiplier}: ${multiplierLabel}`}
        >
          <strong>x{multiplierDetails.multiplier}</strong>
          {multiplierDetails.hasSpain ? "España" : multiplierDetails.roundLabel}
        </span>
      )}
      <div className="compact__teams">
        <div className="compact__row">
          <div className="compact__flag">
            <Flag code={homeCode} instanceKey={`${match.id}-h`} />
          </div>
          <div className="compact__name">{teamLabel(homeCode, homeName)}</div>
          {showScore && (
            <div className={`compact__score ${homeWin ? "compact__score--win" : ""}`}>
              {homeScore}
            </div>
          )}
        </div>
        <div className="compact__row">
          <div className="compact__flag">
            <Flag code={awayCode} instanceKey={`${match.id}-a`} />
          </div>
          <div className="compact__name">{teamLabel(awayCode, awayName)}</div>
          {showScore && (
            <div className={`compact__score ${awayWin ? "compact__score--win" : ""}`}>
              {awayScore}
            </div>
          )}
        </div>
      </div>

      <div className="compact__divider" />

      <div className="compact__status">
        {state === "finished" && (
          <>
            <StatusPill kind="finished">Terminado</StatusPill>
            <PointsLine value={match.userPoints} played={match.userPrediction !== null} />
          </>
        )}
        {state === "live" && (
          <>
            <StatusPill kind="live">En juego</StatusPill>
            <span className="compact__meta">
              {match.userPrediction
                ? `Tu predicción ${match.userPrediction.home} - ${match.userPrediction.away}`
                : "No jugaste"}
            </span>
          </>
        )}
        {state === "missing" && (
          <>
            <span className="compact__time">{kickoffLabel}</span>
            <GroupPressure
              ready={match.predictorsReady}
              total={match.predictorsTotal}
              missingYou
            />
          </>
        )}
        {state === "predicted" && (
          <>
            <span className="compact__time">{kickoffLabel}</span>
            <GroupPressure
              ready={match.predictorsReady}
              total={match.predictorsTotal}
              prediction={match.userPrediction}
            />
          </>
        )}
        {state === "locked" && (
          <>
            <span className="compact__time">{kickoffLabel}</span>
            <span className="compact__meta compact__meta--muted">Aún no disponible</span>
          </>
        )}
      </div>
    </Wrapper>
  );
}
