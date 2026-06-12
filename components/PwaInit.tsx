"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const INSTALL_PROMPT_KEY = "mundial:pwa-install-prompt:v1";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && navigator.standalone === true)
  );
}

function getPlatform() {
  const userAgent = navigator.userAgent;
  const isIos =
    /iPad|iPhone|iPod/.test(userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (isIos) return "ios";
  if (/Android/.test(userAgent)) return "android";
  return "unsupported";
}

export function PwaInit() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<"android" | "ios" | "unsupported">(
    "unsupported"
  );
  const [preview, setPreview] = useState(false);
  const [installReady, setInstallReady] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const primaryButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Installability still works without surfacing registration errors to users.
      });
    };

    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      deferredPrompt.current = event as BeforeInstallPromptEvent;
      setInstallReady(true);
    };

    const handleInstalled = () => {
      deferredPrompt.current = null;
      setInstallReady(false);
      setOpen(false);
      try {
        localStorage.setItem(INSTALL_PROMPT_KEY, "installed");
      } catch {
        // Installation succeeded even if its state cannot be persisted.
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      const previewPlatform = new URLSearchParams(window.location.search).get(
        "pwa-preview"
      );
      if (previewPlatform === "android" || previewPlatform === "ios") {
        setPlatform(previewPlatform);
        setPreview(true);
        setOpen(true);
        return;
      }
    }

    if (pathname !== "/" || isStandalone()) return;

    try {
      if (localStorage.getItem(INSTALL_PROMPT_KEY)) return;
    } catch {
      // Continue without persistence if browser storage is unavailable.
    }

    const detectedPlatform = getPlatform();
    setPlatform(detectedPlatform);

    const showOnce = () => {
      try {
        localStorage.setItem(INSTALL_PROMPT_KEY, "shown");
      } catch {
        // The prompt still works for this visit without local storage.
      }
      setOpen(true);
    };

    if (detectedPlatform === "ios") {
      showOnce();
      return;
    }

    if (detectedPlatform === "android" && installReady) showOnce();
  }, [installReady, pathname]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    primaryButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const buttons = Array.from(
        dialogRef.current.querySelectorAll<HTMLButtonElement>("button:not(:disabled)")
      );
      if (buttons.length === 0) return;

      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  const install = async () => {
    const prompt = deferredPrompt.current;
    if (!prompt) {
      if (preview) setOpen(false);
      return;
    }

    deferredPrompt.current = null;
    setInstallReady(false);
    try {
      await prompt.prompt();
      await prompt.userChoice;
    } finally {
      setOpen(false);
    }
  };

  if (!open) return null;

  const isIos = platform === "ios";

  return (
    <div className="pwa-install" aria-hidden={!open}>
      <button
        type="button"
        className="pwa-install__backdrop"
        aria-label="Cerrar"
        onClick={close}
      />
      <div
        ref={dialogRef}
        className="pwa-install__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pwa-install-title"
        aria-describedby="pwa-install-description"
      >
        <img
          className="pwa-install__icon"
          src="/icons/icon-192.png"
          width="72"
          height="72"
          alt=""
        />
        <h2 id="pwa-install-title">Añade la Porra a tu móvil</h2>
        {isIos ? (
          <p id="pwa-install-description">
            Pulsa el botón Compartir de Safari y selecciona
            <strong> Añadir a pantalla de inicio</strong>.
          </p>
        ) : (
          <p id="pwa-install-description">
            La Porra mola mucho más si la añades a tu pantalla de inicio como cualquier otra APP.
          </p>
        )}
        <div className="pwa-install__actions">
          <button type="button" className="pwa-install__secondary" onClick={close}>
            Ahora no
          </button>
          <button
            ref={primaryButtonRef}
            type="button"
            className="pwa-install__primary"
            onClick={isIos ? close : install}
          >
            {isIos ? "Entendido" : "Instalar app"}
          </button>
        </div>
      </div>
    </div>
  );
}
