import type { ReactNode } from "react";

export function StatusPill({ kind, children }: { kind: "finished" | "live"; children: ReactNode }) {
  return (
    <span className={`pill pill--${kind}`}>
      {kind === "live" && <span className="pill__dot" />}
      {children}
    </span>
  );
}
