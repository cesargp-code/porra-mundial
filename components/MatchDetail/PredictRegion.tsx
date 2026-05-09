"use client";

import { useState, type ReactNode } from "react";

import { PredictSheet } from "./PredictSheet";

type Prediction = { home: number; away: number };

type Props = {
  children: ReactNode;
};

export function PredictRegion({ children }: Props) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState<Prediction | null>(null);

  return (
    <>
      <div className="hero__status">
        {saved ? (
          <button
            type="button"
            className="predict-btn predict-btn--saved"
            onClick={() => setOpen(true)}
          >
            Tu predicción:
            <strong className="predict-btn__saved-score">
              {saved.home} – {saved.away}
            </strong>
            <span className="predict-btn__chev">
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="5 12 10 17 19 7" />
              </svg>
            </span>
          </button>
        ) : (
          <button type="button" className="predict-btn" onClick={() => setOpen(true)}>
            Hacer predicción
            <span className="predict-btn__chev">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 6 15 12 9 18" />
              </svg>
            </span>
          </button>
        )}
      </div>
      {children}
      <PredictSheet
        open={open}
        onClose={() => setOpen(false)}
        onSave={(pred) => {
          setSaved(pred);
          setOpen(false);
        }}
        initial={saved}
      />
    </>
  );
}
