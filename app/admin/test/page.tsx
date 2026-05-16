import { notFound, redirect } from "next/navigation";

import {
  getAdminProfile,
  getMatches,
  getPredictorCounts,
} from "@/lib/supabase/server";

import {
  disableTestModeAction,
  enableTestModeAction,
  setKnockoutTeamsAction,
  setMatchStateAction,
} from "./actions";

export const dynamic = "force-dynamic";

const fmtKickoff = (iso: string) => {
  const d = new Date(iso);
  const ms = d.getTime() - Date.now();
  const min = Math.round(ms / 60_000);
  const rel =
    Math.abs(min) < 60
      ? `${min}m`
      : Math.abs(min) < 60 * 24
      ? `${Math.round(min / 60)}h`
      : `${Math.round(min / 60 / 24)}d`;
  return `${d.toISOString().slice(0, 16).replace("T", " ")} (${rel})`;
};

const inputStyle: React.CSSProperties = {
  width: 44,
  padding: "2px 4px",
  border: "1px solid #ccc",
  borderRadius: 4,
  textAlign: "center",
};
const teamInputStyle: React.CSSProperties = {
  width: 110,
  padding: "2px 4px",
  border: "1px solid #ccc",
  borderRadius: 4,
};
const codeInputStyle: React.CSSProperties = { ...teamInputStyle, width: 50 };
const btnStyle: React.CSSProperties = {
  padding: "4px 8px",
  border: "1px solid #888",
  borderRadius: 4,
  background: "#f4f4f4",
  cursor: "pointer",
  fontSize: 12,
};
const btnPrimary: React.CSSProperties = {
  ...btnStyle,
  background: "#0070f3",
  color: "#fff",
  borderColor: "#0070f3",
};
const btnDanger: React.CSSProperties = {
  ...btnStyle,
  background: "#e00",
  color: "#fff",
  borderColor: "#e00",
};
const rowStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 6,
  padding: 12,
  marginBottom: 8,
  fontSize: 13,
  fontFamily: "ui-monospace, monospace",
  background: "#fff",
};
const formStyle: React.CSSProperties = {
  display: "inline-flex",
  gap: 4,
  alignItems: "center",
  marginRight: 8,
  marginTop: 6,
};

export default async function AdminTestPage() {
  const profile = await getAdminProfile();
  if (!profile) redirect("/login");
  if (!profile.is_admin) notFound();

  const [matches, predictorCounts] = await Promise.all([
    getMatches(),
    getPredictorCounts(),
  ]);

  const sorted = [...matches].sort((a, b) => {
    const at = a.is_test ? 0 : 1;
    const bt = b.is_test ? 0 : 1;
    if (at !== bt) return at - bt;
    const ac = predictorCounts.get(a.id) ?? 0;
    const bc = predictorCounts.get(b.id) ?? 0;
    if (ac !== bc) return bc - ac;
    return a.match_number - b.match_number;
  });

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto", color: "#111" }}>
      <h1 style={{ fontSize: 20, marginBottom: 8 }}>Test Harness</h1>
      <div
        style={{
          background: "#fff8c4",
          border: "1px solid #e6c200",
          padding: 10,
          borderRadius: 6,
          marginBottom: 16,
          fontSize: 13,
        }}
      >
        <strong>TEST MODE writes directly to the production DB.</strong> Matches
        in test mode are skipped by <code>sync-matches</code> until disabled.
        Kickoff offsets are minutes from now: positive = kicked off N min ago,
        negative = kickoff in N min.
      </div>

      {sorted.map((m) => {
        const predictors = predictorCounts.get(m.id) ?? 0;
        return (
          <div key={m.id} style={rowStyle}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontWeight: 700 }}>#{m.match_number}</span>
              <span>{m.round}</span>
              <span>
                {m.home_team_code ?? "TBD"} vs {m.away_team_code ?? "TBD"}
              </span>
              <span style={{ color: "#666" }}>{fmtKickoff(m.kickoff_utc)}</span>
              <span
                style={{
                  padding: "1px 6px",
                  borderRadius: 999,
                  background:
                    m.status === "live"
                      ? "#ffebcc"
                      : m.status === "completed"
                      ? "#d6f5d6"
                      : "#eee",
                }}
              >
                {m.status}
              </span>
              {m.is_test && (
                <span
                  style={{
                    padding: "1px 6px",
                    borderRadius: 999,
                    background: "#fff8c4",
                    border: "1px solid #e6c200",
                  }}
                >
                  TEST
                </span>
              )}
              <span>
                score: {m.home_score ?? "—"}–{m.away_score ?? "—"}
                {m.home_pen !== null && m.away_pen !== null && (
                  <> (pens {m.home_pen}–{m.away_pen})</>
                )}
              </span>
              <span style={{ color: "#666" }}>{predictors} pred</span>
              <span style={{ color: "#999", fontSize: 11 }}>id={m.id}</span>
            </div>

            <div style={{ marginTop: 8 }}>
              {!m.is_test ? (
                <form action={enableTestModeAction} style={formStyle}>
                  <input type="hidden" name="matchId" value={m.id} />
                  <button style={btnPrimary} type="submit">Enable test mode</button>
                </form>
              ) : (
                <>
                  <form action={setMatchStateAction} style={formStyle}>
                    <input type="hidden" name="matchId" value={m.id} />
                    <input type="hidden" name="status" value="scheduled" />
                    <input type="hidden" name="kickoffOffsetMin" value="-60" />
                    <button style={btnStyle} type="submit">Scheduled (kickoff +1h)</button>
                  </form>
                  <form action={setMatchStateAction} style={formStyle}>
                    <input type="hidden" name="matchId" value={m.id} />
                    <input type="hidden" name="status" value="scheduled" />
                    <input type="hidden" name="kickoffOffsetMin" value="-1" />
                    <button style={btnStyle} type="submit">Scheduled (kickoff in 1m)</button>
                  </form>

                  <form action={setMatchStateAction} style={formStyle}>
                    <input type="hidden" name="matchId" value={m.id} />
                    <input type="hidden" name="status" value="live" />
                    <input type="hidden" name="kickoffOffsetMin" value="30" />
                    <input style={inputStyle} name="homeScore" type="number" min={0} placeholder="h" defaultValue={m.home_score ?? 0} />
                    <input style={inputStyle} name="awayScore" type="number" min={0} placeholder="a" defaultValue={m.away_score ?? 0} />
                    <button style={btnStyle} type="submit">Set live</button>
                  </form>

                  <form action={setMatchStateAction} style={formStyle}>
                    <input type="hidden" name="matchId" value={m.id} />
                    <input type="hidden" name="status" value="completed" />
                    <input type="hidden" name="kickoffOffsetMin" value="120" />
                    <input style={inputStyle} name="homeScore" type="number" min={0} placeholder="h" defaultValue={m.home_score ?? 0} />
                    <input style={inputStyle} name="awayScore" type="number" min={0} placeholder="a" defaultValue={m.away_score ?? 0} />
                    <button style={btnStyle} type="submit">Set completed</button>
                  </form>

                  <form action={setMatchStateAction} style={formStyle}>
                    <input type="hidden" name="matchId" value={m.id} />
                    <input type="hidden" name="status" value="completed" />
                    <input type="hidden" name="kickoffOffsetMin" value="135" />
                    <input style={inputStyle} name="homeScore" type="number" min={0} placeholder="h" defaultValue={m.home_score ?? 1} />
                    <input style={inputStyle} name="awayScore" type="number" min={0} placeholder="a" defaultValue={m.away_score ?? 1} />
                    <span style={{ color: "#666" }}>pens</span>
                    <input style={inputStyle} name="homePen" type="number" min={0} placeholder="ph" defaultValue={m.home_pen ?? 5} />
                    <input style={inputStyle} name="awayPen" type="number" min={0} placeholder="pa" defaultValue={m.away_pen ?? 4} />
                    <button style={btnStyle} type="submit">Set completed (pens)</button>
                  </form>

                  <form action={setKnockoutTeamsAction} style={formStyle}>
                    <input type="hidden" name="matchId" value={m.id} />
                    <input style={teamInputStyle} name="homeTeam" placeholder="home name" defaultValue={m.home_team ?? ""} />
                    <input style={codeInputStyle} name="homeCode" placeholder="HOM" defaultValue={m.home_team_code ?? ""} />
                    <input style={teamInputStyle} name="awayTeam" placeholder="away name" defaultValue={m.away_team ?? ""} />
                    <input style={codeInputStyle} name="awayCode" placeholder="AWY" defaultValue={m.away_team_code ?? ""} />
                    <button style={btnStyle} type="submit">Set teams</button>
                  </form>

                  <form action={disableTestModeAction} style={formStyle}>
                    <input type="hidden" name="matchId" value={m.id} />
                    <button style={btnDanger} type="submit">Disable</button>
                  </form>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
