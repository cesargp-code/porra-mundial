"use client";

import { useEffect } from "react";

export function PwaInit() {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Installability still works without surfacing registration errors to users.
      });
    });
  }, []);

  return null;
}
