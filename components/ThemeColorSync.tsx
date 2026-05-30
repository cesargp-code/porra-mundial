"use client";

import { useEffect } from "react";

import { createClient } from "@/lib/supabase/client";

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

    async function refreshThemeColor() {
      const { data, error } = await supabase
        .from("matches")
        .select("id")
        .eq("status", "live")
        .limit(1);

      if (disposed || error) return;

      setThemeColor(data && data.length > 0 ? LIVE_THEME_COLOR : DEFAULT_THEME_COLOR);
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
      setThemeColor(DEFAULT_THEME_COLOR);
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
