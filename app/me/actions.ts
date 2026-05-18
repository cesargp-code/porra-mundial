"use server";

import { revalidatePath } from "next/cache";

import { getAdminProfile } from "@/lib/supabase/server";

export type SyncMatchesState = { ok: boolean; message: string } | null;

export async function syncMatchesNow(
  _prev: SyncMatchesState,
  _fd: FormData
): Promise<SyncMatchesState> {
  const profile = await getAdminProfile();
  if (!profile?.is_admin) {
    return { ok: false, message: "Solo administradores" };
  }

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/sync-matches`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-cron-secret": process.env.CRON_SECRET!,
        "x-force-sync": "1",
      },
      body: "{}",
    });
    if (!res.ok) {
      return { ok: false, message: `Error ${res.status}: ${await res.text()}` };
    }
    const json = (await res.json()) as { synced?: number; skipped_test?: number };

    revalidatePath("/");
    revalidatePath("/me");

    const synced = json.synced ?? 0;
    const skipped = json.skipped_test ?? 0;
    const skippedNote = skipped > 0 ? ` (${skipped} en modo test)` : "";
    return {
      ok: true,
      message: `${synced} partidos sincronizados${skippedNote}`,
    };
  } catch (err) {
    return { ok: false, message: `Falló: ${String(err)}` };
  }
}
