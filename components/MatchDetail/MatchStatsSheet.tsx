"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import type { DbMatchStats } from "@/lib/supabase/types";

type Props = {
  matchStats: DbMatchStats;
  homeCode: string | null;
  awayCode: string | null;
};

type TimelineEvent = {
  team?: unknown;
  type?: unknown;
  extra?: unknown;
  minute?: unknown;
  player?: unknown;
};

const STAT_ROWS = [
  ["Posesión", "home_possession", "away_possession", "%"],
  ["Tiros", "home_shots", "away_shots", ""],
  ["A puerta", "home_shots_on_target", "away_shots_on_target", ""],
  ["Corners", "home_corners", "away_corners", ""],
  ["Faltas", "home_fouls", "away_fouls", ""],
  ["Amarillas", "home_yellows", "away_yellows", ""],
  ["Rojas", "home_reds", "away_reds", ""],
] as const;

function statValue(stats: Record<string, unknown> | null, key: string, suffix: string) {
  const value = stats?.[key];
  if (typeof value !== "number") return "—";
  return `${value}${suffix}`;
}

function statNumber(stats: Record<string, unknown> | null, key: string) {
  const value = stats?.[key];
  return typeof value === "number" ? value : null;
}

function eventLabel(type: unknown) {
  if (type === "goal") return "Gol";
  if (type === "own_goal") return "Gol en propia";
  if (type === "yellow_card") return "Amarilla";
  if (type === "red_card") return "Roja";
  if (typeof type !== "string") return "Evento";
  return type
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function EventIcon({ type }: { type: unknown }) {
  if (type === "yellow_card" || type === "red_card") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect
          x="7"
          y="3"
          width="10"
          height="18"
          rx="1.8"
          className={
            type === "red_card"
              ? "match-stats-sheet__icon-card match-stats-sheet__icon-card--red"
              : "match-stats-sheet__icon-card match-stats-sheet__icon-card--yellow"
          }
        />
      </svg>
    );
  }

  if (type === "goal" || type === "own_goal") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          className="match-stats-sheet__icon-ball-line"
          d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"
        />
        <path
          className="match-stats-sheet__icon-ball-line"
          d="M12 7l4.76 3.45l-1.76 5.55h-6l-1.76 -5.55l4.76 -3.45"
        />
        <path
          className="match-stats-sheet__icon-ball-line"
          d="M12 7v-4m3 13l2.5 3m-.74 -8.55l3.74 -1.45m-11.44 7.05l-2.56 2.95m.74 -8.55l-3.74 -1.45"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="7" className="match-stats-sheet__icon-dot" />
    </svg>
  );
}

function minuteLabel(event: TimelineEvent) {
  const minute = typeof event.minute === "number" ? event.minute : null;
  if (minute === null) return "—";
  const extra = typeof event.extra === "number" ? event.extra : null;
  return extra !== null ? `${minute}+${extra}'` : `${minute}'`;
}

function timelineEvents(timeline: unknown[] | null): TimelineEvent[] {
  return (timeline ?? []).filter(
    (event): event is TimelineEvent =>
      !!event && typeof event === "object" && !Array.isArray(event)
  );
}

function eventSide(event: TimelineEvent, homeCode: string | null, awayCode: string | null) {
  if (typeof event.team !== "string") return "unknown";
  if (homeCode && event.team === homeCode) return "home";
  if (awayCode && event.team === awayCode) return "away";
  return "unknown";
}

export function MatchStatsSheet({
  matchStats,
  homeCode,
  awayCode,
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const events = timelineEvents(matchStats.timeline);

  const sheet = (
    <>
      <div
        className={`sheet-backdrop ${open ? "sheet-backdrop--open" : ""}`}
        onClick={() => setOpen(false)}
      />
      <div
        className={`sheet sheet--info ${open ? "sheet--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Estadísticas"
      >
        <div className="sheet__handle" />
        <div className="sheet__head sheet__head--info">
          <div className="sheet__title">Estadísticas</div>
          <button
            type="button"
            className="sheet__close"
            onClick={() => setOpen(false)}
          >
            Cerrar
          </button>
        </div>

        <div className="match-stats-sheet__body">
          <div className="match-stats-sheet__stats" aria-label="Comparativa de estadísticas">
            {STAT_ROWS.map(([label, homeKey, awayKey, suffix]) => {
              const homeValue = statNumber(matchStats.stats, homeKey);
              const awayValue = statNumber(matchStats.stats, awayKey);
              const homeHigh =
                homeValue !== null && awayValue !== null && homeValue > awayValue;
              const awayHigh =
                homeValue !== null && awayValue !== null && awayValue > homeValue;

              return (
                <div className="match-stats-sheet__stat-row" key={homeKey}>
                  <strong
                    className={`match-stats-sheet__stat-value ${
                      homeHigh ? "match-stats-sheet__stat-value--high" : ""
                    }`}
                  >
                    {statValue(matchStats.stats, homeKey, suffix)}
                  </strong>
                  <span>{label}</span>
                  <strong
                    className={`match-stats-sheet__stat-value match-stats-sheet__stat-value--away ${
                      awayHigh ? "match-stats-sheet__stat-value--high" : ""
                    }`}
                  >
                    {statValue(matchStats.stats, awayKey, suffix)}
                  </strong>
                </div>
              );
            })}
          </div>

          <div>
            <div className="match-stats-sheet__h">Timeline</div>
            {events.length > 0 ? (
              <div className="match-stats-sheet__timeline">
                {events.map((event, index) => {
                  const side = eventSide(event, homeCode, awayCode);
                  const card = (
                    <span className="match-stats-sheet__event-card">
                      <span className="match-stats-sheet__icon">
                        <EventIcon type={event.type} />
                      </span>
                      <span className="match-stats-sheet__event-main">
                        <strong>{eventLabel(event.type)}</strong>
                        <span>
                          {typeof event.player === "string" ? event.player : "—"}
                        </span>
                      </span>
                    </span>
                  );

                  return (
                    <div
                      className={`match-stats-sheet__event match-stats-sheet__event--${side}`}
                      key={`${minuteLabel(event)}-${index}`}
                    >
                      <span className="match-stats-sheet__event-side">
                        {side === "home" ? card : null}
                      </span>
                      <span className="match-stats-sheet__minute">{minuteLabel(event)}</span>
                      <span className="match-stats-sheet__event-side">
                        {side === "away" || side === "unknown" ? card : null}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="match-stats-sheet__empty">Sin eventos</p>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <button
        type="button"
        className="pill pill--finished pill--button"
        onClick={() => setOpen(true)}
      >
        Terminado
        <span className="pill__chev" aria-hidden="true">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </span>
      </button>
      {mounted ? createPortal(sheet, document.body) : null}
    </>
  );
}
