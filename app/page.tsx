import { DayHeader } from "@/components/DayHeader";
import { MatchCard } from "@/components/MatchCard";
import { groupByDay, toUiMatch } from "@/lib/matches";
import { getMatches } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function MatchListPage() {
  const rows = await getMatches();
  const groups = groupByDay(rows.map(toUiMatch));

  return (
    <div className="screen" data-screen-label="01 Match List">
      <header className="appbar">
        <div className="appbar__title">
          Porra Mundial
          <small>2026 · Poligoneros</small>
        </div>
        <div className="avatar" aria-label="Tu avatar">
          JM
        </div>
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
