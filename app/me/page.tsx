import Link from "next/link";
import { redirect } from "next/navigation";

import { RankingTabs } from "@/components/RankingTabs";
import { getCurrentUserId, getProfiles } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const profiles = await getProfiles();
  const me = profiles.find((p) => p.id === userId);
  const userName = me?.nickname ?? "Tú";

  return (
    <div className="screen" data-screen-label="Cuenta">
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
          <div className="topbar__when">Cuenta</div>
        </div>
      </div>

      <RankingTabs
        userName={userName}
        defaultTab="user"
        rankingContent={null}
        userContent={
          <div className="me">
            <form action="/auth/signout" method="post">
              <button type="submit" className="auth-button me__signout">
                Salir
              </button>
            </form>
          </div>
        }
      />
    </div>
  );
}
