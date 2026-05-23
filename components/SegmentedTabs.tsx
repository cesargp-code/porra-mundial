"use client";

import { useRef, useState, type PointerEvent, type ReactNode } from "react";

type TabSide = "left" | "right";

type Props = {
  ariaLabel: string;
  leftLabel: string;
  rightLabel: string;
  leftContent: ReactNode;
  rightContent: ReactNode;
  defaultTab?: TabSide;
  headerContent?: ReactNode;
  preserveSticky?: boolean;
};

export function SegmentedTabs({
  ariaLabel,
  leftLabel,
  rightLabel,
  leftContent,
  rightContent,
  defaultTab = "left",
  headerContent,
  preserveSticky = false,
}: Props) {
  const [active, setActive] = useState<TabSide>(defaultTab);
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

    if (dx < 0 && active === "left") setActive("right");
    if (dx > 0 && active === "right") setActive("left");

    swipeRef.current.tracking = false;
  }

  function handlePointerEnd(event: PointerEvent<HTMLDivElement>) {
    if (swipeRef.current.pointerId !== event.pointerId) return;
    swipeRef.current.tracking = false;
  }

  const rootClassName = `rtabs ${preserveSticky ? "rtabs--preserve-sticky" : ""}`;
  const trackClassName = preserveSticky
    ? `rtabs__track rtabs__track--static rtabs__track--${active}`
    : `rtabs__track rtabs__track--${active}`;
  const control = (
    <div className="seg" role="tablist" aria-label={ariaLabel}>
      <span className={`seg__thumb seg__thumb--${active}`} aria-hidden="true" />
      <button
        type="button"
        role="tab"
        aria-selected={active === "left"}
        className={`seg__btn ${active === "left" ? "seg__btn--active" : ""}`}
        onClick={() => setActive("left")}
      >
        {leftLabel}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={active === "right"}
        className={`seg__btn ${active === "right" ? "seg__btn--active" : ""}`}
        onClick={() => setActive("right")}
      >
        {rightLabel}
      </button>
    </div>
  );

  return (
    <div className={rootClassName}>
      {headerContent ? (
        <header className="appbar appbar--with-tabs">
          {headerContent}
          {control}
        </header>
      ) : (
        control
      )}

      <div
        className="rtabs__viewport"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <div className={trackClassName}>
          <section
            className="rtabs__page"
            role="tabpanel"
            aria-hidden={active !== "left"}
          >
            {leftContent}
          </section>
          <section
            className="rtabs__page"
            role="tabpanel"
            aria-hidden={active !== "right"}
          >
            {rightContent}
          </section>
        </div>
      </div>
    </div>
  );
}
