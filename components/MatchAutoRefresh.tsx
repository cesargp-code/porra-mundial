"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { createClient } from "@/lib/supabase/client";

const REFRESH_DEBOUNCE_MS = 750;

export function MatchAutoRefresh({
  matchId,
  refreshAfter,
}: {
  matchId?: string;
  refreshAfter?: string;
}) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let refreshTimer: number | undefined;
    let catchUpTimer: number | undefined;

    const refreshAfterMs = refreshAfter
      ? new Date(refreshAfter).getTime()
      : Number.NaN;

    function refreshSoon() {
      if (refreshTimer) window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => router.refresh(), REFRESH_DEBOUNCE_MS);
    }

    function refreshIfSyncCouldHaveRun() {
      if (!Number.isFinite(refreshAfterMs) || Date.now() < refreshAfterMs) return;
      refreshSoon();
    }

    const filter = matchId
      ? { event: "*" as const, schema: "public", table: "matches", filter: `id=eq.${matchId}` }
      : { event: "*" as const, schema: "public", table: "matches" };

    const channel = supabase
      .channel(matchId ? `match-auto-refresh-${matchId}` : "matches-auto-refresh")
      .on("postgres_changes", filter, refreshSoon)
      .subscribe();

    if (Number.isFinite(refreshAfterMs)) {
      const delay = refreshAfterMs - Date.now();
      if (delay > 0) {
        catchUpTimer = window.setTimeout(refreshSoon, delay);
      }
    }

    function refreshWhenVisible() {
      if (document.visibilityState === "visible") refreshIfSyncCouldHaveRun();
    }

    window.addEventListener("focus", refreshIfSyncCouldHaveRun);
    window.addEventListener("online", refreshIfSyncCouldHaveRun);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      if (refreshTimer) window.clearTimeout(refreshTimer);
      if (catchUpTimer) window.clearTimeout(catchUpTimer);
      window.removeEventListener("focus", refreshIfSyncCouldHaveRun);
      window.removeEventListener("online", refreshIfSyncCouldHaveRun);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      supabase.removeChannel(channel);
    };
  }, [matchId, refreshAfter, router]);

  return null;
}
