"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";

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
  queryParam?: string;
  leftQueryValue?: string;
  rightQueryValue?: string;
  leftLocatorDayKey?: string;
  leftLocatorLabel?: string;
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
  queryParam,
  leftQueryValue = "left",
  rightQueryValue = "right",
  leftLocatorDayKey,
  leftLocatorLabel = "Hoy",
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [active, setActive] = useState<TabSide>(defaultTab);
  const [showLeftLocatorLabel, setShowLeftLocatorLabel] = useState(false);
  const swipeRef = useRef({
    pointerId: -1,
    startX: 0,
    startY: 0,
    tracking: false,
  });

  function selectTab(next: TabSide) {
    setActive(next);
    if (!queryParam) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set(queryParam, next === "left" ? leftQueryValue : rightQueryValue);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const getLocatorDay = useCallback(() => {
    if (!leftLocatorDayKey) return null;
    return document.querySelector<HTMLElement>(`[data-day-key="${leftLocatorDayKey}"]`);
  }, [leftLocatorDayKey]);

  const updateLeftLocatorLabel = useCallback(() => {
    if (active !== "left") {
      setShowLeftLocatorLabel(false);
      return;
    }

    const day = getLocatorDay();
    if (!day) {
      setShowLeftLocatorLabel(false);
      return;
    }

    const appbar = document.querySelector<HTMLElement>(".appbar");
    const appbarBottom = appbar?.getBoundingClientRect().bottom ?? 0;
    setShowLeftLocatorLabel(Math.abs(day.getBoundingClientRect().top - appbarBottom) > 24);
  }, [active, getLocatorDay]);

  useEffect(() => {
    updateLeftLocatorLabel();
    window.addEventListener("scroll", updateLeftLocatorLabel, { passive: true });
    window.addEventListener("resize", updateLeftLocatorLabel);

    return () => {
      window.removeEventListener("scroll", updateLeftLocatorLabel);
      window.removeEventListener("resize", updateLeftLocatorLabel);
    };
  }, [updateLeftLocatorLabel]);

  function scrollToLeftLocator() {
    const day = getLocatorDay();
    if (!day) return;

    const appbar = document.querySelector<HTMLElement>(".appbar");
    const appbarBottom = appbar?.getBoundingClientRect().bottom ?? 0;
    window.scrollTo({
      top: Math.max(0, window.scrollY + day.getBoundingClientRect().top - appbarBottom),
      behavior: "instant",
    });
    setShowLeftLocatorLabel(false);
  }

  function handleLeftClick() {
    if (active === "left" && showLeftLocatorLabel) {
      scrollToLeftLocator();
      return;
    }

    selectTab("left");
  }

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

    if (dx < 0 && active === "left") selectTab("right");
    if (dx > 0 && active === "right") selectTab("left");

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
  const leftDisplayLabel = showLeftLocatorLabel ? leftLocatorLabel : leftLabel;
  const control = (
    <div className="seg" role="tablist" aria-label={ariaLabel}>
      <span className={`seg__thumb seg__thumb--${active}`} aria-hidden="true" />
      <button
        type="button"
        role="tab"
        aria-label={leftDisplayLabel}
        aria-selected={active === "left"}
        className={`seg__btn ${active === "left" ? "seg__btn--active" : ""}`}
        onClick={handleLeftClick}
      >
        <span
          className={`seg__label ${showLeftLocatorLabel ? "" : "seg__label--visible"}`}
          aria-hidden="true"
        >
          {leftLabel}
        </span>
        <span
          className={`seg__label ${showLeftLocatorLabel ? "seg__label--visible" : ""}`}
          aria-hidden="true"
        >
          {leftLocatorLabel}
        </span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={active === "right"}
        className={`seg__btn ${active === "right" ? "seg__btn--active" : ""}`}
        onClick={() => selectTab("right")}
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
