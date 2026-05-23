"use client";

import { useActionState } from "react";

import { syncGroupsNow, type SyncGroupsState } from "@/app/me/actions";

export function SyncGroupsButton() {
  const [state, formAction, pending] = useActionState<SyncGroupsState, FormData>(
    syncGroupsNow,
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
          {pending ? "Sincronizando…" : "Sincronizar grupos"}
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
