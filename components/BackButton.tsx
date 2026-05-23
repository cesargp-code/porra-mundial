"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

function BackIcon({ pending }: { pending: boolean }) {
  if (pending) {
    return <span className="iconbtn__spinner" aria-hidden="true" />;
  }
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 18 L9 12 L15 6" />
    </svg>
  );
}

export function BackButton({ href = "/" }: { href?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const fromList = searchParams.get("from") === "list";

  function handleClick() {
    setPending(true);
    if (fromList && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(href);
  }

  return (
    <button type="button" className="iconbtn" aria-label="Volver" onClick={handleClick}>
      <BackIcon pending={pending} />
    </button>
  );
}
