"use client";

import { useState, type ReactNode } from "react";

type Tab = "ranking" | "user";

type Props = {
  userName: string;
  rankingContent: ReactNode;
  userContent: ReactNode;
  defaultTab?: Tab;
};

export function RankingTabs({
  userName,
  rankingContent,
  userContent,
  defaultTab = "user",
}: Props) {
  const [active, setActive] = useState<Tab>(defaultTab);

  return (
    <div className="rtabs">
      <div className="seg" role="tablist" aria-label="Vista">
        <span className={`seg__thumb seg__thumb--${active}`} aria-hidden="true" />
        <button
          type="button"
          role="tab"
          aria-selected={active === "ranking"}
          className={`seg__btn ${active === "ranking" ? "seg__btn--active" : ""}`}
          onClick={() => setActive("ranking")}
        >
          Clasificación
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={active === "user"}
          className={`seg__btn ${active === "user" ? "seg__btn--active" : ""}`}
          onClick={() => setActive("user")}
        >
          {userName}
        </button>
      </div>

      <div className="rtabs__viewport">
        <div className={`rtabs__track rtabs__track--${active}`}>
          <section
            className="rtabs__page"
            role="tabpanel"
            aria-hidden={active !== "ranking"}
          >
            {rankingContent}
          </section>
          <section
            className="rtabs__page"
            role="tabpanel"
            aria-hidden={active !== "user"}
          >
            {userContent}
          </section>
        </div>
      </div>
    </div>
  );
}
