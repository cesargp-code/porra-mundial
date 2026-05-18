"use client";

import { useActionState } from "react";

import { syncMatchesNow, type SyncMatchesState } from "@/app/me/actions";

export function SyncMatchesButton() {
  const [state, formAction, pending] = useActionState<SyncMatchesState, FormData>(
    syncMatchesNow,
    null
  );

  return (
    <div>
      <form action={formAction}>
        <button
          type="submit"
          className="auth-button me__signout"
          disabled={pending}
        >
          {pending ? "Sincronizando…" : "Sincronizar partidos"}
        </button>
      </form>
      {state && (
        <div
          className={`sync-feedback ${state.ok ? "sync-feedback--ok" : "sync-feedback--err"}`}
          role="status"
        >
          {state.message}
        </div>
      )}
    </div>
  );
}
