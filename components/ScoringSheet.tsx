"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function ScoringSheet() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const sheet = (
    <>
      <div
        className={`sheet-backdrop ${open ? "sheet-backdrop--open" : ""}`}
        onClick={() => setOpen(false)}
      />
      <div
        className={`sheet sheet--info ${open ? "sheet--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Cómo se puntúa"
      >
        <div className="sheet__handle" />
        <div className="sheet__head sheet__head--info">
          <div className="sheet__title">Cómo se puntúa</div>
          <button
            type="button"
            className="sheet__close"
            onClick={() => setOpen(false)}
          >
            Cerrar
          </button>
        </div>

        <div className="scoring-sheet__body">
          <p className="scoring-sheet__intro">
            Cuanto más fina la predicción, más puntos. Acertar el ganador ya
            suma; clavar el marcador es lo gordo.
          </p>

          <div>
            <div className="scoring-sheet__h">Puntos por partido</div>
            <ul className="scoring-sheet__list">
              <li className="scoring-sheet__row">
                <span>Te equivocaste de ganador (o fallaste el empate)</span>
                <span className="scoring-sheet__pts scoring-sheet__pts--zero">
                  0
                </span>
              </li>
              <li className="scoring-sheet__row">
                <span>
                  Acertaste quién gana, pero la diferencia se te va por 2 o más
                </span>
                <span className="scoring-sheet__pts">2</span>
              </li>
              <li className="scoring-sheet__row">
                <span>Acertaste el ganador y te quedas a un gol de la diferencia</span>
                <span className="scoring-sheet__pts">3</span>
              </li>
              <li className="scoring-sheet__row">
                <span>Acertaste el ganador y la diferencia de goles exacta</span>
                <span className="scoring-sheet__pts">4</span>
              </li>
              <li className="scoring-sheet__row">
                <span>Marcador exacto. Ojo de halcón.</span>
                <span className="scoring-sheet__pts scoring-sheet__pts--top">
                  5
                </span>
              </li>
            </ul>
          </div>

          <div>
            <div className="scoring-sheet__h">Eliminatorias</div>
            <p className="scoring-sheet__p">
              Funciona igual, pero el marcador cuenta incluyendo la prórroga.
              Si predices empate (es decir, que se decide en los penaltis),
              tienes que elegir quién ganará la tanda: <b>+2 pts</b> si
              aciertas.
            </p>
          </div>

          <div>
            <div className="scoring-sheet__h">Las rondas pesan más</div>
            <p className="scoring-sheet__p">
              Los puntos del partido se multiplican según la ronda. La final
              vale más que un partido de grupos.
            </p>
            <div className="scoring-sheet__mult">
              <div className="scoring-sheet__mult-row">
                <span>Fase de grupos</span>
                <span className="scoring-sheet__mult-x">×1</span>
              </div>
              <div className="scoring-sheet__mult-row">
                <span>Dieciseisavos</span>
                <span className="scoring-sheet__mult-x">×3</span>
              </div>
              <div className="scoring-sheet__mult-row">
                <span>Octavos</span>
                <span className="scoring-sheet__mult-x">×5</span>
              </div>
              <div className="scoring-sheet__mult-row">
                <span>Cuartos</span>
                <span className="scoring-sheet__mult-x">×8</span>
              </div>
              <div className="scoring-sheet__mult-row">
                <span>Semifinales</span>
                <span className="scoring-sheet__mult-x">×12</span>
              </div>
              <div className="scoring-sheet__mult-row">
                <span>Tercer puesto</span>
                <span className="scoring-sheet__mult-x">×6</span>
              </div>
              <div className="scoring-sheet__mult-row">
                <span>Final</span>
                <span className="scoring-sheet__mult-x">×?</span>
              </div>
            </div>
            <p className="scoring-sheet__foot">
              El multiplicador de la final se anunciará antes del partido.
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className="scoring-cta-wrap">
        <button
          type="button"
          className="scoring-cta"
          onClick={() => setOpen(true)}
        >
          Cómo se puntúa
        </button>
      </div>
      {mounted ? createPortal(sheet, document.body) : null}
    </>
  );
}
