import Link from "next/link";

import { Flag, teamLabel } from "./flags";
import { GroupPressure } from "./GroupPressure";
import { PointsLine } from "./PointsLine";
import { StatusPill } from "./StatusPill";
import { timeLabel } from "@/lib/format";
import type { UiMatch } from "@/lib/matches";

export function MatchCard({ match }: { match: UiMatch }) {
  const { state, homeCode, awayCode, homeName, awayName, homeScore, awayScore } = match;
  const showScore =
    (state === "finished" || state === "live") && homeScore !== null && awayScore !== null;
  const homeWin = showScore && (homeScore as number) > (awayScore as number);
  const awayWin = showScore && (awayScore as number) > (homeScore as number);
  const className = `card card--compact card--${state}`;

  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    state === "locked" ? (
      <article className={className} aria-disabled="true">
        {children}
      </article>
    ) : (
      <Link href={`/match/${match.id}`} className={className}>
        {children}
      </Link>
    );

  return (
    <Wrapper>
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
            <PointsLine value={match.userPoints} />
          </>
        )}
        {state === "live" && (
          <>
            <StatusPill kind="live">En juego</StatusPill>
            <PointsLine value={match.userPoints} provisional />
          </>
        )}
        {state === "missing" && (
          <>
            <span className="compact__time">{timeLabel(match.kickoff)}</span>
            <GroupPressure
              ready={match.predictorsReady}
              total={match.predictorsTotal}
              missingYou
            />
          </>
        )}
        {state === "predicted" && (
          <>
            <span className="compact__time">{timeLabel(match.kickoff)}</span>
            <GroupPressure
              ready={match.predictorsReady}
              total={match.predictorsTotal}
              prediction={match.userPrediction}
            />
          </>
        )}
        {state === "locked" && (
          <>
            <span className="compact__time">{timeLabel(match.kickoff)}</span>
            <span className="compact__meta compact__meta--muted">Aún no disponible</span>
          </>
        )}
      </div>
    </Wrapper>
  );
}
