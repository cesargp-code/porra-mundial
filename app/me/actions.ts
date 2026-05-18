"use server";

import { revalidatePath } from "next/cache";

import { getAdminProfile } from "@/lib/supabase/server";

export async function syncMatchesNow() {
  const profile = await getAdminProfile();
  if (!profile?.is_admin) throw new Error("admin only");

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/sync-matches`;
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
    throw new Error(`sync failed: ${res.status} ${await res.text()}`);
  }

  revalidatePath("/");
  revalidatePath("/me");
}
