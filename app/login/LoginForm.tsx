"use client";

import { useState, type FormEvent } from "react";

import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "submitting" | "sent";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email || status === "submitting") return;

    setStatus("submitting");
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback`;

    // Always show the success card, regardless of whether the user exists.
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo, shouldCreateUser: false },
    });

    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="auth-card">
        <div className="auth-success">
          <p>
            Si ya tenías usuario te llegará un enlace para entrar. Si es la primera vez
            que entras asegúrate de que César te ha dado de alta antes.
          </p>
          <p>Y por si acaso, revisa tu carpeta de spam.</p>
        </div>
        <button
          type="button"
          className="auth-link"
          onClick={() => {
            setStatus("idle");
            setEmail("");
          }}
        >
          Enviar otro enlace
        </button>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form className="auth-card" onSubmit={onSubmit} noValidate>
      <h2 className="auth-card-title">Iniciar sesión</h2>

      <label className="auth-label" htmlFor="email">
        Correo electrónico
      </label>
      <input
        id="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        required
        placeholder="tu@email.com"
        className="auth-input"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={submitting}
      />

      <button type="submit" className="auth-button" disabled={submitting || !email}>
        {submitting ? "Enviando…" : "Enviar enlace mágico"}
      </button>

      <div className="auth-divider" />

      <p className="auth-hint">
        Te enviaremos un enlace para iniciar sesión sin necesidad de contraseña.
      </p>
    </form>
  );
}
