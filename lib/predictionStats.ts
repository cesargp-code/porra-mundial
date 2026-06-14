export type PredictionScore = {
  home_score: number;
  away_score: number;
};

export type PredictionStats = {
  avgGoals: number;
  drawRate: number;
};

type MatchScore = {
  status: string;
  id: string;
  home_score: number | null;
  away_score: number | null;
};

type PredictionWithMatchId = PredictionScore & {
  match_id: string;
};

export type CompletedPredictionStats = {
  correctResults: number;
  exactScores: number;
};

function scoreResult(home: number, away: number) {
  return home > away ? "home" : home < away ? "away" : "draw";
}

export function getCompletedPredictionStats(
  matches: MatchScore[],
  predictions: PredictionWithMatchId[]
): CompletedPredictionStats {
  const predictionByMatchId = new Map(
    predictions.map((prediction) => [prediction.match_id, prediction])
  );

  return matches.reduce(
    (stats, match) => {
      if (
        match.status !== "completed" ||
        match.home_score === null ||
        match.away_score === null
      ) {
        return stats;
      }

      const prediction = predictionByMatchId.get(match.id);
      if (!prediction) return stats;

      if (
        scoreResult(prediction.home_score, prediction.away_score) ===
        scoreResult(match.home_score, match.away_score)
      ) {
        stats.correctResults += 1;
      }

      if (
        prediction.home_score === match.home_score &&
        prediction.away_score === match.away_score
      ) {
        stats.exactScores += 1;
      }

      return stats;
    },
    { correctResults: 0, exactScores: 0 }
  );
}

export function getPredictionStats(rows: PredictionScore[]): PredictionStats {
  if (rows.length === 0) {
    return { avgGoals: 0, drawRate: 0 };
  }

  const totals = rows.reduce(
    (acc, row) => {
      acc.goals += row.home_score + row.away_score;
      if (row.home_score === row.away_score) acc.draws += 1;
      return acc;
    },
    { goals: 0, draws: 0 }
  );

  return {
    avgGoals: totals.goals / rows.length,
    drawRate: totals.draws / rows.length,
  };
}
