"use client";

import { useEffect } from "react";

import { isMatchActive } from "@/lib/matchState";
import { createClient } from "@/lib/supabase/client";
import type { MatchStatus } from "@/lib/supabase/types";

const DEFAULT_THEME_COLOR = "#D8F24A";
const LIVE_THEME_COLOR = "#E89A1A";

function setThemeColor(color: string) {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');

  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }

  meta.content = color;
}

export function ThemeColorSync() {
  useEffect(() => {
    const supabase = createClient();
    let disposed = false;
    let kickoffTimer: number | undefined;

    async function refreshThemeColor() {
      const { data, error } = await supabase
        .from("matches")
        .select("kickoff_utc, status")
        .neq("status", "completed");

      if (disposed || error) return;

      const now = Date.now();
      const unresolved = (data ?? []) as Array<{
        kickoff_utc: string;
        status: MatchStatus;
      }>;
      setThemeColor(
        unresolved.some((match) => isMatchActive(match, now))
          ? LIVE_THEME_COLOR
          : DEFAULT_THEME_COLOR
      );

      if (kickoffTimer) window.clearTimeout(kickoffTimer);
      const nextKickoff = unresolved
        .map((match) => new Date(match.kickoff_utc).getTime())
        .filter((kickoff) => kickoff > now)
        .sort((a, b) => a - b)[0];
      if (nextKickoff) {
        kickoffTimer = window.setTimeout(refreshThemeColor, nextKickoff - now + 250);
      }
    }

    refreshThemeColor();

    const channel = supabase
      .channel("theme-color-match-status")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches" },
        () => {
          refreshThemeColor();
        }
      )
      .subscribe();

    const interval = window.setInterval(refreshThemeColor, 60_000);

    return () => {
      disposed = true;
      window.clearInterval(interval);
      if (kickoffTimer) window.clearTimeout(kickoffTimer);
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
