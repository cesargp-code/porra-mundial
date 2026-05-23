"use client";

import { useRef, useState, type PointerEvent, type ReactNode } from "react";

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
  const swipeRef = useRef({
    pointerId: -1,
    startX: 0,
    startY: 0,
    tracking: false,
  });

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse") return;

    swipeRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      tracking: true,
    };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const swipe = swipeRef.current;
    if (!swipe.tracking || swipe.pointerId !== event.pointerId) return;

    const dx = event.clientX - swipe.startX;
    const dy = event.clientY - swipe.startY;

    if (Math.abs(dx) < 42 || Math.abs(dx) < Math.abs(dy) * 1.4) return;

    if (dx < 0 && active === "ranking") setActive("user");
    if (dx > 0 && active === "user") setActive("ranking");

    swipeRef.current.tracking = false;
  }

  function handlePointerEnd(event: PointerEvent<HTMLDivElement>) {
    if (swipeRef.current.pointerId !== event.pointerId) return;
    swipeRef.current.tracking = false;
  }

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

      <div
        className="rtabs__viewport"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
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
