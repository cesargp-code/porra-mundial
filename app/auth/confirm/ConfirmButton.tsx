"use client";

import { useState } from "react";

type Props = {
  tokenHash: string;
  type: string;
  next: string;
};

export function ConfirmButton({ tokenHash, type, next }: Props) {
  const [clicked, setClicked] = useState(false);

  function onClick() {
    if (clicked) return;
    setClicked(true);
    const params = new URLSearchParams({
      token_hash: tokenHash,
      type,
      next,
    });
    window.location.href = `/auth/callback?${params.toString()}`;
  }

  return (
    <button
      type="button"
      className="auth-button"
      onClick={onClick}
      disabled={clicked}
      style={{ marginTop: 0 }}
    >
      {clicked ? "Entrando…" : "Entrar a la porra"}
    </button>
  );
}
