import type { CSSProperties } from "react";

import { MatchCard } from "@/components/MatchCard";
import type { BracketRound, UiMatch } from "@/lib/matches";

const SLOT_GAP = 116;
const CARD_HEIGHT = 102;
const CARD_CENTER = 56;

const ROUND_ORDER = [
  { key: "R32", label: "Dieciseisavos", matches: [74, 77, 73, 75, 83, 84, 81, 82, 76, 78, 79, 80, 86, 88, 85, 87] },
  { key: "R16", label: "Octavos", matches: [89, 90, 93, 94, 91, 92, 95, 96] },
  { key: "QF", label: "Cuartos", matches: [97, 98, 99, 100] },
  { key: "SF", label: "Semifinal", matches: [101, 102] },
  { key: "final", label: "Final", matches: [104, 103] },
] as const;

const MATCH_SOURCES: Record<number, number[]> = {
  89: [74, 77],
  90: [73, 75],
  91: [76, 78],
  92: [79, 80],
  93: [83, 84],
  94: [81, 82],
  95: [86, 88],
  96: [85, 87],
  97: [89, 90],
  98: [93, 94],
  99: [91, 92],
  100: [95, 96],
  101: [97, 98],
  102: [99, 100],
  104: [101, 102],
};

function getBracketMatches(rounds: BracketRound[]) {
  const byNumber = new Map<number, UiMatch>();
  for (const round of rounds) {
    for (const match of round.items) {
      byNumber.set(match.matchNumber, match);
    }
  }
  return byNumber;
}

function getPositions() {
  const positions = new Map<number, number>();
  const firstRound = ROUND_ORDER[0];

  firstRound.matches.forEach((matchNumber, index) => {
    positions.set(matchNumber, index);
  });

  for (const round of ROUND_ORDER.slice(1)) {
    round.matches.forEach((matchNumber, fallbackIndex) => {
      const sourcePositions = (MATCH_SOURCES[matchNumber] ?? [])
        .map((source) => positions.get(source))
        .filter((position): position is number => typeof position === "number");
      const position =
        sourcePositions.length > 0
          ? Math.min(...sourcePositions)
          : matchNumber === 103 && positions.has(104)
            ? (positions.get(104) as number) + 1.15
          : fallbackIndex;
      positions.set(matchNumber, position);
    });
  }

  return positions;
}

export function BracketView({ rounds }: { rounds: BracketRound[] }) {
  const matches = getBracketMatches(rounds);
  const positions = getPositions();
  const stageHeight = (ROUND_ORDER[0].matches.length - 1) * SLOT_GAP + CARD_HEIGHT;

  if (matches.size === 0) {
    return (
      <div className="bracket-empty">
        <strong>El cuadro aún no está disponible</strong>
        <span>Cuando entren los cruces de eliminatorias aparecerán aquí.</span>
      </div>
    );
  }

  return (
    <div className="bracket" aria-label="Cuadro de eliminatorias" data-tab-swipe-boundary>
      <div className="bracket__rail" style={{ minHeight: stageHeight + 58 }}>
        {ROUND_ORDER.map((round) => (
          <section className="bracket__round" key={round.key}>
            <h2 className="bracket__title">{round.label}</h2>
            <div className="bracket__stage" style={{ height: stageHeight }}>
              {round.matches.map((matchNumber) => {
                const match = matches.get(matchNumber);
                if (!match) return null;

                const top = (positions.get(matchNumber) ?? 0) * SLOT_GAP;
                const sources = MATCH_SOURCES[matchNumber] ?? [];
                const sourceTops = sources
                  .map((source) => positions.get(source))
                  .filter((position): position is number => typeof position === "number")
                  .map((position) => position * SLOT_GAP + CARD_CENTER)
                  .sort((a, b) => a - b);
                const connectorStyle = sourceTops.length === 2
                  ? ({
                      "--connector-top": `${sourceTops[0] - top}px`,
                      "--connector-height": `${sourceTops[1] - sourceTops[0]}px`,
                    } as CSSProperties)
                  : undefined;

                return (
                  <div
                    className={`bracket__slot ${sourceTops.length === 2 ? "bracket__slot--linked" : ""}`}
                    key={match.id}
                    style={{ top, ...connectorStyle }}
                  >
                    <MatchCard
                      match={match}
                      timeFormat="compact-date-time"
                    />
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
