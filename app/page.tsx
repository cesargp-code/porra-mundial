import { DayHeader } from "@/components/DayHeader";
import { MatchCard } from "@/components/MatchCard";
import { groupByDay, toUiMatch } from "@/lib/matches";
import { createClient, getMatches } from "@/lib/supabase/server";

export const revalidate = 60;

function initialsFor(user: { email?: string | null; user_metadata?: Record<string, unknown> } | null): string {
  if (!user) return "··";
  const name = (user.user_metadata?.full_name as string | undefined) ?? "";
  const source = name.trim() || user.email?.split("@")[0] || "";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  const letters = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? parts[0]?.[1] ?? "");
  return letters.toUpperCase() || "··";
}

export default async function MatchListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const rows = await getMatches();
  const groups = groupByDay(rows.map(toUiMatch));

  return (
    <div className="screen" data-screen-label="01 Match List">
      <header className="appbar">
        <div className="appbar__title">
          Porra Mundial
          <small>2026 · Poligoneros</small>
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="avatar avatar--button"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            {initialsFor(user)}
          </button>
        </form>
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
