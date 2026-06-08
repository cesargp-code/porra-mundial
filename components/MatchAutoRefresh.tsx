"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { createClient } from "@/lib/supabase/client";

const REFRESH_DEBOUNCE_MS = 750;

export function MatchAutoRefresh({
  matchId,
  kickoff,
}: {
  matchId?: string;
  kickoff?: string;
}) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let refreshTimer: number | undefined;
    let kickoffTimer: number | undefined;

    function refreshSoon() {
      if (refreshTimer) window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => router.refresh(), REFRESH_DEBOUNCE_MS);
    }

    const filter = matchId
      ? { event: "*" as const, schema: "public", table: "matches", filter: `id=eq.${matchId}` }
      : { event: "*" as const, schema: "public", table: "matches" };

    const channel = supabase
      .channel(matchId ? `match-auto-refresh-${matchId}` : "matches-auto-refresh")
      .on("postgres_changes", filter, refreshSoon)
      .subscribe();

    if (kickoff) {
      const delay = new Date(kickoff).getTime() - Date.now();
      if (delay > 0) {
        kickoffTimer = window.setTimeout(refreshSoon, delay + 250);
      }
    }

    function refreshWhenVisible() {
      if (document.visibilityState === "visible") refreshSoon();
    }

    window.addEventListener("focus", refreshSoon);
    window.addEventListener("online", refreshSoon);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      if (refreshTimer) window.clearTimeout(refreshTimer);
      if (kickoffTimer) window.clearTimeout(kickoffTimer);
      window.removeEventListener("focus", refreshSoon);
      window.removeEventListener("online", refreshSoon);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      supabase.removeChannel(channel);
    };
  }, [kickoff, matchId, router]);

  return null;
}
