"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

export async function resetPassword(email: string) {
  const supabase = await createClient();
  const headerStore = await headers();
  const origin = headerStore.get("origin") || headerStore.get("referer")?.replace(/\/forgot-password.*/, "") || "";

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  return { success: true };
}
