"use client";

import { useState, type FormEvent } from "react";

import {
  generateMagicLinkAction,
  inviteUserAction,
  type LinkResult,
} from "./actions";

type Mode = "invite" | "magiclink";

const btn: React.CSSProperties = {
  padding: "6px 12px",
  border: "1px solid #888",
  borderRadius: 4,
  background: "#f4f4f4",
  cursor: "pointer",
  fontSize: 12,
  fontFamily: "inherit",
};
const btnPrimary: React.CSSProperties = {
  ...btn,
  background: "#0070f3",
  color: "#fff",
  borderColor: "#0070f3",
};
const btnSuccess: React.CSSProperties = {
  ...btn,
  background: "#0a7d4a",
  color: "#fff",
  borderColor: "#0a7d4a",
};
const inputStyle: React.CSSProperties = {
  padding: "6px 8px",
  border: "1px solid #ccc",
  borderRadius: 4,
  fontSize: 13,
  fontFamily: "inherit",
  minWidth: 220,
};
const linkBox: React.CSSProperties = {
  fontSize: 11,
  fontFamily: "ui-monospace, monospace",
  color: "#555",
  background: "#f7f7f5",
  border: "1px solid #e2e2de",
  borderRadius: 4,
  padding: "6px 8px",
  wordBreak: "break-all",
  marginTop: 6,
};

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

type GetLinkButtonProps = {
  email: string;
  mode: Mode;
  label: string;
  variant?: "primary" | "success" | "default";
};

export function GetLinkButton({ email, mode, label, variant }: GetLinkButtonProps) {
  const [state, setState] = useState<
    | { kind: "idle" }
    | { kind: "loading" }
    | { kind: "ok"; url: string; copied: boolean }
    | { kind: "err"; msg: string }
  >({ kind: "idle" });

  async function onClick() {
    setState({ kind: "loading" });
    const fn = mode === "invite" ? inviteUserAction : generateMagicLinkAction;
    const res: LinkResult = await fn(email);
    if ("error" in res) {
      setState({ kind: "err", msg: res.error });
      return;
    }
    const copied = await copy(res.url);
    setState({ kind: "ok", url: res.url, copied });
  }

  const baseStyle =
    variant === "primary"
      ? btnPrimary
      : variant === "success"
        ? btnSuccess
        : btn;

  return (
    <div>
      <button
        type="button"
        style={baseStyle}
        onClick={onClick}
        disabled={state.kind === "loading"}
      >
        {state.kind === "loading"
          ? "Generando…"
          : state.kind === "ok" && state.copied
            ? "✓ Copiado"
            : label}
      </button>
      {state.kind === "ok" && (
        <>
          <div style={linkBox}>{state.url}</div>
          {!state.copied && (
            <button
              type="button"
              style={{ ...btn, marginTop: 4 }}
              onClick={async () => {
                const ok = await copy(state.url);
                setState({ ...state, copied: ok });
              }}
            >
              Copiar manualmente
            </button>
          )}
        </>
      )}
      {state.kind === "err" && (
        <div style={{ ...linkBox, color: "#b3261e", background: "#fde7e6", borderColor: "#f0c7c4" }}>
          {state.msg}
        </div>
      )}
    </div>
  );
}

export function InviteForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<
    | { kind: "idle" }
    | { kind: "loading" }
    | { kind: "ok"; url: string; copied: boolean }
    | { kind: "err"; msg: string }
  >({ kind: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email || state.kind === "loading") return;
    setState({ kind: "loading" });
    const res = await inviteUserAction(email);
    if ("error" in res) {
      setState({ kind: "err", msg: res.error });
      return;
    }
    const copied = await copy(res.url);
    setState({ kind: "ok", url: res.url, copied });
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}
    >
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="email"
          required
          placeholder="email@ejemplo.com"
          style={inputStyle}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state.kind === "loading"}
        />
        <button
          type="submit"
          style={btnPrimary}
          disabled={state.kind === "loading" || !email}
        >
          {state.kind === "loading" ? "Creando…" : "Crear + copiar enlace"}
        </button>
        {state.kind === "ok" && (
          <span style={{ fontSize: 12, color: "#0a7d4a" }}>
            {state.copied ? "✓ Copiado al portapapeles" : "Enlace generado"}
          </span>
        )}
      </div>
      {state.kind === "ok" && <div style={linkBox}>{state.url}</div>}
      {state.kind === "err" && (
        <div style={{ ...linkBox, color: "#b3261e", background: "#fde7e6", borderColor: "#f0c7c4" }}>
          {state.msg}
        </div>
      )}
    </form>
  );
}
