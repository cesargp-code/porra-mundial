export type DetailState = "finished" | "live" | "upcoming";

export type Player = {
  id: string;
  name: string;
  you?: boolean;
};

export type FinishedOrLivePlay = {
  guess: { home: number; away: number };
  points: number;
  penWinnerLabel?: string;
};

export type UpcomingPlay = {
  ready: boolean;
};
