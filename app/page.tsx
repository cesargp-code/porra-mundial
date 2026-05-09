import { DayHeader } from "@/components/DayHeader";
import { MatchCard } from "@/components/MatchCard";
import { groupByDay, toUiMatch } from "@/lib/matches";
import { getMatches } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function MatchListPage() {
  const rows = await getMatches();
  const groups = groupByDay(rows.map(toUiMatch));

  const rank = 3;
  const points = 147;

  return (
    <div className="screen" data-screen-label="01 Match List">
      <header className="appbar">
        <div className="appbar__title">
          Porra Mundial
          <small>2026 · Poligoneros</small>
        </div>
        <button
          type="button"
          className="rank-link"
          aria-label={`Ver clasificación — vas ${rank}º con ${points} puntos`}
        >
          <span className="rank-link__pos"><b>{rank}º</b></span>
          <span className="rank-link__sep" aria-hidden="true" />
          <span className="rank-link__pts"><b>{points}</b> pts</span>
          <span className="rank-link__chev" aria-hidden="true">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </span>
        </button>
      </header>

      {groups.map((g) => (
        <section key={g.key} className="day-group">
          <DayHeader label={g.label} count={g.items.length} />
          <div className="list">
            {g.items.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </section>
      ))}

      <div className="list-end">FIN DE LA LISTA</div>
    </div>
  );
}
