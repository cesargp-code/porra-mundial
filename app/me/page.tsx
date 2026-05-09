import Link from "next/link";
import { redirect } from "next/navigation";

import { RankingTabs } from "@/components/RankingTabs";
import {
  getCurrentUserId,
  getPointsByUser,
  getProfiles,
} from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const [profiles, pointsByUser] = await Promise.all([
    getProfiles(),
    getPointsByUser(),
  ]);

  const me = profiles.find((p) => p.id === userId);
  const userName = me?.nickname ?? "Tú";

  const ranked = profiles
    .map((p) => ({
      id: p.id,
      name: p.nickname,
      points: pointsByUser.get(p.id) ?? 0,
    }))
    .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));

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
        defaultTab="ranking"
        rankingContent={
          <div className="hero hero--leaderboard">
            <div className="players--embedded">
              {ranked.map((p, i) => (
                <div
                  key={p.id}
                  className={`player player--rank${p.id === userId ? " player--you" : ""}`}
                >
                  <div className="player__rank">{i + 1}º</div>
                  <div className="player__name">{p.name}</div>
                  <div
                    className={`player__points ${p.points > 0 ? "player__points--win" : "player__points--zero"}`}
                  >
                    <strong>{p.points}</strong>
                    <span className="player__points-lbl">pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        }
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
