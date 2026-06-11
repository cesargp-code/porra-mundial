type Player = {
  id: string;
  nickname: string;
};

export type RankedPlayer = {
  id: string;
  name: string;
  points: number;
  rank: number;
};

export function rankPlayers(
  players: Player[],
  pointsByUser: ReadonlyMap<string, number>
): RankedPlayer[] {
  const sorted = players
    .map((player) => ({
      id: player.id,
      name: player.nickname,
      points: pointsByUser.get(player.id) ?? 0,
    }))
    .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));

  let rank = 0;
  let previousPoints: number | undefined;

  return sorted.map((player, index) => {
    if (index === 0 || player.points !== previousPoints) rank = index + 1;
    previousPoints = player.points;
    return { ...player, rank };
  });
}
