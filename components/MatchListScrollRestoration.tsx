"use client";

import { useLayoutEffect } from "react";

import {
  MATCH_LIST_RETURN_KEY,
  type MatchListReturnState,
} from "@/lib/matchListNavigation";

function readReturnState(): MatchListReturnState | null {
  try {
    const value = sessionStorage.getItem(MATCH_LIST_RETURN_KEY);
    return value ? (JSON.parse(value) as MatchListReturnState) : null;
  } catch {
    return null;
  }
}

export function MatchListScrollRestoration({ targetDayKey }: { targetDayKey?: string }) {
  useLayoutEffect(() => {
    const state = readReturnState();
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    const shouldRestoreReturn = state?.listUrl === currentUrl;
    if (!shouldRestoreReturn && !targetDayKey) return;

    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        if (shouldRestoreReturn && state) {
          const cards = document.querySelectorAll<HTMLElement>("[data-match-id]");
          const card = Array.from(cards).find(
            (candidate) =>
              candidate.dataset.matchId === state.matchId &&
              candidate.getClientRects().length > 0,
          );

          if (card) {
            const top = window.scrollY + card.getBoundingClientRect().top - state.viewportTop;
            window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
          } else {
            window.scrollTo({ top: state.scrollY, behavior: "instant" });
          }

          try {
            sessionStorage.removeItem(MATCH_LIST_RETURN_KEY);
          } catch {
            // A stale value is harmless if storage becomes unavailable.
          }

          return;
        }

        const day = document.querySelector<HTMLElement>(
          `[data-day-key="${targetDayKey}"]`,
        );
        if (day) {
          const appbar = document.querySelector<HTMLElement>(".appbar");
          const appbarBottom = appbar?.getBoundingClientRect().bottom ?? 0;
          window.scrollTo({
            top: Math.max(0, window.scrollY + day.getBoundingClientRect().top - appbarBottom),
            behavior: "instant",
          });
        }
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.history.scrollRestoration = previousRestoration;
    };
  }, [targetDayKey]);

  return null;
}
