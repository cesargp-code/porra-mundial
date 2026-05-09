import { Flag, teamLabel } from "../flags/index";
import type { DetailState } from "./types";

type Props = {
  matchId: string;
  state: DetailState;
  homeCode: string | null;
  awayCode: string | null;
  homeName: string;
  awayName: string;
  homeScore: number | null;
  awayScore: number | null;
};

export function Hero({
  matchId,
  state,
  homeCode,
  awayCode,
  homeName,
  awayName,
  homeScore,
  awayScore,
}: Props) {
  const showScore =
    (state === "finished" || state === "live") && homeScore !== null && awayScore !== null;
  const winner =
    showScore && homeScore !== null && awayScore !== null
      ? homeScore > awayScore
        ? "home"
        : awayScore > homeScore
          ? "away"
          : null
      : null;

  return (
    <>
      <div className="hero__teams">
        <div className="hero__col">
          <div className="hero__flag">
            <Flag code={homeCode} instanceKey={`${matchId}-detail-h`} />
          </div>
          <div className="hero__name">{teamLabel(homeCode, homeName)}</div>
          {showScore ? (
            <div className={`hero__score ${winner === "home" ? "hero__score--win" : ""}`}>
              {homeScore}
            </div>
          ) : (
            <div className="hero__score hero__score--upcoming">–</div>
          )}
        </div>
        <div className="hero__sep">vs</div>
        <div className="hero__col">
          <div className="hero__flag">
            <Flag code={awayCode} instanceKey={`${matchId}-detail-a`} />
          </div>
          <div className="hero__name">{teamLabel(awayCode, awayName)}</div>
          {showScore ? (
            <div className={`hero__score ${winner === "away" ? "hero__score--win" : ""}`}>
              {awayScore}
            </div>
          ) : (
            <div className="hero__score hero__score--upcoming">–</div>
          )}
        </div>
      </div>

      {state !== "upcoming" && (
        <div className="hero__status">
          {state === "finished" && <span className="pill pill--finished">Terminado</span>}
          {state === "live" && (
            <span className="pill pill--live">
              <span className="pill__dot" />
              En juego
            </span>
          )}
        </div>
      )}
    </>
  );
}
