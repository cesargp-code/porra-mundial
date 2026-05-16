"use client";

import { useEffect, useRef, useState } from "react";

import { teamLabel } from "@/components/flags";

const NUMBERS = Array.from({ length: 21 }, (_, i) => i);

type Prediction = { home: number; away: number; penWinner: string | null };

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (pred: Prediction) => void;
  initial?: Prediction | null;
  saving?: boolean;
  error?: string | null;
  isKnockout?: boolean;
  homeTeam?: string | null;
  awayTeam?: string | null;
  homeCode?: string | null;
  awayCode?: string | null;
};

export function PredictSheet({
  open,
  onClose,
  onSave,
  initial,
  saving = false,
  error = null,
  isKnockout = false,
  homeTeam = null,
  awayTeam = null,
  homeCode = null,
  awayCode = null,
}: Props) {
  const [home, setHome] = useState<number | null>(null);
  const [away, setAway] = useState<number | null>(null);
  const [manualWinner, setManualWinner] = useState<string | null>(null);
  const homeRef = useRef<HTMLDivElement>(null);
  const awayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setHome(initial?.home ?? null);
    setAway(initial?.away ?? null);
    setManualWinner(initial?.penWinner ?? null);
    requestAnimationFrame(() => {
      if (homeRef.current) homeRef.current.scrollTop = 0;
      if (awayRef.current) awayRef.current.scrollTop = 0;
    });
  }, [open, initial]);

  // Show the picker only when knockout AND both teams are known. TBD legs
  // (e.g. early bracket placeholders) have no buttons to render.
  const showPicker = isKnockout && !!homeTeam && !!awayTeam;
  const scoreSet = home !== null && away !== null;
  const scoreWinner: string | null =
    scoreSet && home !== null && away !== null
      ? home > away
        ? homeTeam
        : home < away
          ? awayTeam
          : null
      : null;
  const isDraw = scoreSet && scoreWinner === null;
  const activeWinner = scoreWinner ?? (isDraw ? manualWinner : null);

  const canSave =
    scoreSet && !saving && (!showPicker || !isDraw || manualWinner !== null);

  const homeLabel = teamLabel(homeCode, homeTeam ?? "");
  const awayLabel = teamLabel(awayCode, awayTeam ?? "");

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
          <button type="button" className="sheet__close" onClick={onClose}>
            Cerrar
          </button>
          <button
            className="sheet__save"
            disabled={!canSave}
            onClick={() => {
              if (home !== null && away !== null) {
                // Only persist a penalty winner when the prediction is a draw
                // (the only case the scoring engine consults this field).
                const penWinner = showPicker && isDraw ? manualWinner : null;
                onSave({ home, away, penWinner });
              }
            }}
          >
            {saving ? "Guardando…" : "Guardar predicción"}
          </button>
        </div>
        {showPicker && (
          <div className="sheet__advance">
            <span className="sheet__advance-label">Pasa de ronda</span>
            <div className="sheet__advance-buttons">
              <button
                type="button"
                className={`sheet__advance-btn ${activeWinner === homeTeam ? "sheet__advance-btn--active" : ""}`}
                onClick={() => isDraw && setManualWinner(homeTeam)}
                disabled={!isDraw}
                aria-pressed={activeWinner === homeTeam}
              >
                {homeLabel}
              </button>
              <button
                type="button"
                className={`sheet__advance-btn ${activeWinner === awayTeam ? "sheet__advance-btn--active" : ""}`}
                onClick={() => isDraw && setManualWinner(awayTeam)}
                disabled={!isDraw}
                aria-pressed={activeWinner === awayTeam}
              >
                {awayLabel}
              </button>
            </div>
          </div>
        )}
        {error && <div className="sheet__error">{error}</div>}
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
