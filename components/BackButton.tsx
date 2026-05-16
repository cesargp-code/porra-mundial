"use client";

import Link, { useLinkStatus } from "next/link";

function BackIcon() {
  const { pending } = useLinkStatus();
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
  return (
    <Link href={href} className="iconbtn" aria-label="Volver" prefetch>
      <BackIcon />
    </Link>
  );
}
