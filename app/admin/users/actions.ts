"use server";

import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminProfile } from "@/lib/supabase/server";

async function requireAdmin() {
  const profile = await getAdminProfile();
  if (!profile) redirect("/login");
  if (!profile.is_admin) notFound();
}

function siteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return "https://porra26-poligoneros.vercel.app";
}

function callbackUrl(actionLink: string): string {
  const u = new URL(actionLink);
  const tokenHash = u.searchParams.get("token") ?? u.searchParams.get("token_hash");
  const type = u.searchParams.get("type") ?? "magiclink";
  if (!tokenHash) return actionLink;
  return `${siteUrl()}/auth/callback?token_hash=${tokenHash}&type=${type}&next=/`;
}

export type LinkResult = { url: string } | { error: string };

export async function inviteUserAction(email: string): Promise<LinkResult> {
  await requireAdmin();
  const clean = email.trim().toLowerCase();
  if (!clean || !clean.includes("@")) return { error: "Email no válido" };

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "invite",
    email: clean,
    options: { redirectTo: `${siteUrl()}/auth/callback` },
  });
  if (error) return { error: error.message };
  const link = data?.properties?.action_link;
  if (!link) return { error: "No se pudo generar el enlace" };

  revalidatePath("/admin/users");
  return { url: callbackUrl(link) };
}

export async function generateMagicLinkAction(email: string): Promise<LinkResult> {
  await requireAdmin();
  const clean = email.trim().toLowerCase();
  if (!clean) return { error: "Email vacío" };

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: clean,
    options: { redirectTo: `${siteUrl()}/auth/callback` },
  });
  if (error) return { error: error.message };
  const link = data?.properties?.action_link;
  if (!link) return { error: "No se pudo generar el enlace" };

  return { url: callbackUrl(link) };
}
