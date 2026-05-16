"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";

import { savePrediction } from "@/app/match/[id]/actions";

import { PredictSheet } from "./PredictSheet";

type Prediction = { home: number; away: number; penWinner: string | null };

type Props = {
  matchId: string;
  initial: Prediction | null;
  children: ReactNode;
  round: string;
  homeTeam: string | null;
  awayTeam: string | null;
  homeCode: string | null;
  awayCode: string | null;
};

export function PredictRegion({
  matchId,
  initial,
  children,
  round,
  homeTeam,
  awayTeam,
  homeCode,
  awayCode,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState<Prediction | null>(initial);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isKnockout = round !== "group";

  function handleSave(pred: Prediction) {
    setError(null);
    startTransition(async () => {
      const result = await savePrediction(
        matchId,
        pred.home,
        pred.away,
        pred.penWinner
      );
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(pred);
      setOpen(false);
      router.refresh();
    });
  }

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
        onClose={() => {
          setOpen(false);
          setError(null);
        }}
        onSave={handleSave}
        initial={saved}
        saving={isPending}
        error={error}
        isKnockout={isKnockout}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        homeCode={homeCode}
        awayCode={awayCode}
      />
    </>
  );
}
