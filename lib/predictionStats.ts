export type PredictionScore = {
  home_score: number;
  away_score: number;
};

export type PredictionStats = {
  avgGoals: number;
  drawRate: number;
};

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
