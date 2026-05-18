import { notFound, redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminProfile, getProfiles } from "@/lib/supabase/server";

import { GetLinkButton, InviteForm } from "./CopyLink";

export const dynamic = "force-dynamic";

const fmt = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.toISOString().slice(0, 10)} ${d.toISOString().slice(11, 16)}`;
};

const relative = (iso: string | null | undefined): string => {
  if (!iso) return "nunca";
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.round(ms / 60_000);
  if (min < 60) return `hace ${min}m`;
  if (min < 60 * 24) return `hace ${Math.round(min / 60)}h`;
  return `hace ${Math.round(min / 60 / 24)}d`;
};

const page: React.CSSProperties = {
  padding: 16,
  maxWidth: 1100,
  margin: "0 auto",
  color: "#111",
};
const banner: React.CSSProperties = {
  background: "#eef6ff",
  border: "1px solid #b8d8ff",
  padding: 10,
  borderRadius: 6,
  marginBottom: 16,
  fontSize: 13,
};
const table: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 13,
  background: "#fff",
};
const th: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 10px",
  borderBottom: "1px solid #e2e2de",
  fontWeight: 700,
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: "#666",
  background: "#fafaf7",
};
const td: React.CSSProperties = {
  padding: "10px",
  borderBottom: "1px solid #efefec",
  verticalAlign: "top",
};
const badge: React.CSSProperties = {
  display: "inline-block",
  padding: "2px 8px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 600,
};
const badgeOk: React.CSSProperties = {
  ...badge,
  background: "#e2f2ea",
  color: "#0a7d4a",
};
const badgeNever: React.CSSProperties = {
  ...badge,
  background: "#fde7e6",
  color: "#b3261e",
};
const badgeAdmin: React.CSSProperties = {
  ...badge,
  background: "#fff8c4",
  color: "#7a5a00",
  border: "1px solid #e6c200",
  marginLeft: 6,
};

export default async function AdminUsersPage() {
  const profile = await getAdminProfile();
  if (!profile) redirect("/login");
  if (!profile.is_admin) notFound();

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) throw new Error(`Failed to list users: ${error.message}`);

  const profiles = await getProfiles();
  const profileById = new Map(profiles.map((p) => [p.id, p]));

  const users = [...(data?.users ?? [])].sort((a, b) => {
    const aTime = a.last_sign_in_at
      ? new Date(a.last_sign_in_at).getTime()
      : 0;
    const bTime = b.last_sign_in_at
      ? new Date(b.last_sign_in_at).getTime()
      : 0;
    if (aTime !== bTime) return bTime - aTime;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const total = users.length;
  const onboarded = users.filter((u) => u.last_sign_in_at).length;
  const pending = total - onboarded;

  return (
    <div style={page}>
      <h1 style={{ fontSize: 20, marginBottom: 8 }}>Jugadores</h1>

      <div style={banner}>
        <strong>{total}</strong> usuarios · <strong>{onboarded}</strong> han
        entrado · <strong>{pending}</strong> pendientes. Crea o regenera enlaces
        de magic link y envíalos por WhatsApp — no consume el límite de email de
        Supabase.
      </div>

      <h2 style={{ fontSize: 15, margin: "14px 0 8px" }}>Crear nuevo jugador</h2>
      <InviteForm />

      <h2 style={{ fontSize: 15, margin: "14px 0 8px" }}>Usuarios existentes</h2>
      <table style={table}>
        <thead>
          <tr>
            <th style={th}>Email</th>
            <th style={th}>Nickname</th>
            <th style={th}>Creado</th>
            <th style={th}>Último login</th>
            <th style={th}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const p = profileById.get(u.id);
            const neverLogged = !u.last_sign_in_at;
            return (
              <tr key={u.id}>
                <td style={td}>
                  <span style={{ fontFamily: "ui-monospace, monospace" }}>
                    {u.email ?? "—"}
                  </span>
                  {p?.is_admin && <span style={badgeAdmin}>admin</span>}
                </td>
                <td style={td}>{p?.nickname ?? <span style={{ color: "#999" }}>—</span>}</td>
                <td style={td} title={fmt(u.created_at)}>
                  {relative(u.created_at)}
                </td>
                <td style={td}>
                  {neverLogged ? (
                    <span style={badgeNever}>nunca</span>
                  ) : (
                    <span style={badgeOk} title={fmt(u.last_sign_in_at)}>
                      {relative(u.last_sign_in_at)}
                    </span>
                  )}
                </td>
                <td style={td}>
                  <GetLinkButton
                    email={u.email ?? ""}
                    mode="magiclink"
                    label={neverLogged ? "Generar enlace" : "Nuevo enlace"}
                    variant={neverLogged ? "success" : "default"}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
