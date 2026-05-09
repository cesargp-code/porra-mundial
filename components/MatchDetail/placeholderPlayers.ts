// Placeholder roster + synthetic predictions until real predictions/auth land.
// Mirrors the GROUP and MATCHES.plays from the design prototype so the three
// detail states render with realistic content.

export type DetailState = "finished" | "live" | "upcoming";

export type Player = {
  id: string;
  name: string;
  you?: boolean;
};

export type FinishedOrLivePlay = {
  guess: { home: number; away: number };
  points: number;
};

export type UpcomingPlay = {
  ready: boolean;
};

export const GROUP: Player[] = [
  { id: "agustin", name: "Agustín" },
  { id: "bobby", name: "Bobby" },
  { id: "stoit", name: "Stoichkov" },
  { id: "quint", name: "Quintana" },
  { id: "jose", name: "José Luis" },
  { id: "chema", name: "Chema" },
  { id: "cesar", name: "César", you: true },
  { id: "chino", name: "Chino" },
];

export const PLAYS_FINISHED: Record<string, FinishedOrLivePlay> = {
  agustin: { guess: { home: 3, away: 1 }, points: 5 },
  bobby: { guess: { home: 2, away: 1 }, points: 3 },
  stoit: { guess: { home: 3, away: 0 }, points: 3 },
  quint: { guess: { home: 2, away: 0 }, points: 3 },
  jose: { guess: { home: 1, away: 0 }, points: 3 },
  chema: { guess: { home: 3, away: 2 }, points: 1 },
  cesar: { guess: { home: 3, away: 1 }, points: 5 },
  chino: { guess: { home: 0, away: 2 }, points: 0 },
};

export const PLAYS_LIVE: Record<string, FinishedOrLivePlay> = {
  agustin: { guess: { home: 2, away: 0 }, points: 5 },
  bobby: { guess: { home: 3, away: 1 }, points: 3 },
  stoit: { guess: { home: 1, away: 0 }, points: 3 },
  quint: { guess: { home: 2, away: 1 }, points: 3 },
  jose: { guess: { home: 2, away: 0 }, points: 5 },
  chema: { guess: { home: 1, away: 1 }, points: 0 },
  cesar: { guess: { home: 2, away: 0 }, points: 5 },
  chino: { guess: { home: 0, away: 1 }, points: 0 },
};

export const PLAYS_UPCOMING: Record<string, UpcomingPlay> = {
  agustin: { ready: true },
  bobby: { ready: true },
  stoit: { ready: true },
  quint: { ready: true },
  jose: { ready: true },
  chema: { ready: true },
  cesar: { ready: false },
  chino: { ready: false },
};
