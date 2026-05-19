import { redirect } from "next/navigation";

import { BackButton } from "@/components/BackButton";
import { RankingTabs } from "@/components/RankingTabs";
import { ScoringSheet } from "@/components/ScoringSheet";
import { SyncMatchesButton } from "@/components/SyncMatchesButton";
import { getPredictionStats } from "@/lib/predictionStats";
import {
  getCurrentUserId,
  getMatches,
  getMyPredictions,
  getOtherPlayersPredictions,
  getPointsByUser,
  getProfiles,
} from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const numberFmt = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const percentFmt = new Intl.NumberFormat("es-ES", {
  style: "percent",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export default async function MePage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const [profiles, pointsByUser, matches, myPredictions, otherPredictions] =
    await Promise.all([
      getProfiles(),
      getPointsByUser(),
      getMatches(),
      getMyPredictions(userId),
      getOtherPlayersPredictions(userId),
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

  const myPredictionByMatchId = new Map(
    myPredictions.map((p) => [p.match_id, p])
  );

  const availablePlayed = matches.filter(
    (m) =>
      (m.status === "scheduled" || m.status === "live") &&
      m.home_team &&
      m.away_team &&
      myPredictionByMatchId.has(m.id)
  ).length;
  const availableMissing = matches.filter(
    (m) =>
      m.status === "scheduled" &&
      m.home_team &&
      m.away_team &&
      !myPredictionByMatchId.has(m.id)
  ).length;

  const exactPredictions = matches.filter((m) => {
    if (m.status !== "completed") return false;
    const p = myPredictionByMatchId.get(m.id);
    if (!p) return false;
    return p.home_score === m.home_score && p.away_score === m.away_score;
  }).length;

  const userStats = getPredictionStats(myPredictions);
  const crowdStats = getPredictionStats(otherPredictions);

  return (
    <div className="screen" data-screen-label="Fan Zone">
      <div className="topbar">
        <BackButton href="/" />
        <div className="topbar__meta">
          <div className="topbar__when">FAN ZONE</div>
          <div className="topbar__where">Poligoneros</div>
        </div>
      </div>

      <RankingTabs
        userName={userName}
        defaultTab="ranking"
        rankingContent={
          <>
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
            <ScoringSheet />
          </>
        }
        userContent={
          <div className="user-tab">
            <section className="stat-section">
              <h2 className="stat-section__title">Partidos</h2>
              <div className="hero hero--leaderboard">
                <div className="players--embedded">
                  <div className="player">
                    <div className="player__name">Disponibles jugados</div>
                    <div className="player__points">
                      <strong>{availablePlayed}</strong>
                    </div>
                  </div>
                  <div className="player">
                    <div className="player__name">Disponibles sin jugar</div>
                    <div className="player__points player__points--alert">
                      <strong>{availableMissing}</strong>
                    </div>
                  </div>
                  <div className="player">
                    <div className="player__name">Predicciones exactas</div>
                    <div className="player__points">
                      <strong>{exactPredictions}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="stat-section">
              <h2 className="stat-section__title">
                Predicción de goles por partido
              </h2>
              <div className="hero hero--leaderboard">
                <div className="players--embedded">
                  <div className="player">
                    <div className="player__name">{userName}</div>
                    <div className="player__points">
                      <strong>{numberFmt.format(userStats.avgGoals)}</strong>
                    </div>
                  </div>
                  <div className="player">
                    <div className="player__name">Resto</div>
                    <div className="player__points">
                      <strong>{numberFmt.format(crowdStats.avgGoals)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="stat-section">
              <h2 className="stat-section__title">
                Predicción de empates por partido
              </h2>
              <div className="hero hero--leaderboard">
                <div className="players--embedded">
                  <div className="player">
                    <div className="player__name">{userName}</div>
                    <div className="player__points">
                      <strong>{percentFmt.format(userStats.drawRate)}</strong>
                    </div>
                  </div>
                  <div className="player">
                    <div className="player__name">Resto</div>
                    <div className="player__points">
                      <strong>{percentFmt.format(crowdStats.drawRate)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {me?.is_admin && (
              <div className="user-tab__signout">
                <SyncMatchesButton />
              </div>
            )}

            <div className="user-tab__signout">
              <form action="/auth/signout" method="post">
                <button type="submit" className="auth-button me__signout">
                  Salir del juego
                </button>
              </form>
            </div>
          </div>
        }
      />
    </div>
  );
}
