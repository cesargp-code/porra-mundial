"use client";

import { useEffect, useRef, useState } from "react";

const NUMBERS = Array.from({ length: 21 }, (_, i) => i);

type Prediction = { home: number; away: number };

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (pred: Prediction) => void;
  initial?: Prediction | null;
};

export function PredictSheet({ open, onClose, onSave, initial }: Props) {
  const [home, setHome] = useState<number | null>(null);
  const [away, setAway] = useState<number | null>(null);
  const homeRef = useRef<HTMLDivElement>(null);
  const awayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setHome(initial?.home ?? null);
    setAway(initial?.away ?? null);
    requestAnimationFrame(() => {
      if (homeRef.current) homeRef.current.scrollTop = 0;
      if (awayRef.current) awayRef.current.scrollTop = 0;
    });
  }, [open, initial]);

  const canSave = home !== null && away !== null;

  return (
    <>
      <div
        className={`sheet-backdrop ${open ? "sheet-backdrop--open" : ""}`}
        onClick={onClose}
      />
      <div
        className={`sheet ${open ? "sheet--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Hacer predicción"
      >
        <div className="sheet__handle" />
        <div className="sheet__head">
          <button className="sheet__close" onClick={onClose} aria-label="Cerrar">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            >
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
          <div className="sheet__title">Tu predicción</div>
          <button
            className="sheet__save"
            disabled={!canSave}
            onClick={() => {
              if (home !== null && away !== null) onSave({ home, away });
            }}
          >
            Guardar predicción
          </button>
        </div>
        <div className="sheet__body">
          <div className="sheet__col">
            <div className="sheet__numbers" ref={homeRef}>
              <div className="sheet__numpad" />
              {NUMBERS.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`sheet__num ${home === n ? "sheet__num--selected" : ""}`}
                  onClick={() => setHome(n)}
                >
                  {n}
                </button>
              ))}
              <div className="sheet__numpad" />
            </div>
          </div>
          <div className="sheet__col">
            <div className="sheet__numbers" ref={awayRef}>
              <div className="sheet__numpad" />
              {NUMBERS.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`sheet__num ${away === n ? "sheet__num--selected" : ""}`}
                  onClick={() => setAway(n)}
                >
                  {n}
                </button>
              ))}
              <div className="sheet__numpad" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
