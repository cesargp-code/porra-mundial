import type {
  DetailState,
  FinishedOrLivePlay,
  Player,
  UpcomingPlay,
} from "./types";

type Props = {
  player: Player;
  state: DetailState;
  play?: FinishedOrLivePlay | UpcomingPlay;
  realScore?: { home: number; away: number } | null;
};

function isScored(p: Props["play"]): p is FinishedOrLivePlay {
  return !!p && "guess" in p;
}

function isReady(p: Props["play"]): p is UpcomingPlay {
  return !!p && "ready" in p;
}

export function PlayerRow({ player, state, play, realScore }: Props) {
  const className = `player${player.you ? " player--you" : ""}`;

  if ((state === "finished" || state === "live") && isScored(play)) {
    const exact =
      realScore != null &&
      play.guess.home === realScore.home &&
      play.guess.away === realScore.away;
    const pointsCls =
      state === "live"
        ? "player__points--prov"
        : play.points > 0
          ? "player__points--win"
          : "player__points--zero";

    return (
      <div className={className}>
        <div className="player__name">{player.name}</div>
        <div className={`player__guess${exact ? " player__guess--exact" : ""}`}>
          {play.guess.home}–{play.guess.away}
        </div>
        <div className={`player__points ${pointsCls}`}>
          <strong>{play.points}</strong>
          <span className="player__points-lbl">puntos</span>
        </div>
      </div>
    );
  }

  if (state === "upcoming") {
    const ready = isReady(play) && play.ready;
    return (
      <div className={className}>
        <div className="player__name">{player.name}</div>
        <div className="player__status">
          {ready ? (
            <span className="player__icon player__icon--yes">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12 L10 17 L19 7" />
              </svg>
            </span>
          ) : (
            <span className="player__icon player__icon--no">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              >
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </span>
          )}
        </div>
      </div>
    );
  }

  return null;
}
