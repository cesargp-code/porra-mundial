import Link from "next/link";

export function DetailTopbar({ when, where }: { when: string; where: string }) {
  return (
    <div className="topbar">
      <Link href="/" className="iconbtn" aria-label="Volver">
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
      </Link>
      <div className="topbar__meta">
        <div className="topbar__when">{when}</div>
        {where && <div className="topbar__where">{where}</div>}
      </div>
    </div>
  );
}
