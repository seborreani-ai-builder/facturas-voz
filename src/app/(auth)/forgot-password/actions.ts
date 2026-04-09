"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { headers } from "next/headers";

export async function resetPassword(email: string) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const origin =
    headerStore.get("origin") ||
    headerStore.get("referer")?.replace(/\/forgot-password.*/, "") ||
    "";

  // Use implicit flow (not PKCE) to avoid code_verifier cookie issues.
  // The reset link will redirect with #access_token in the hash,
  // which the client-side page handles via onAuthStateChange.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: "implicit",
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ignored in Server Component context
          }
        },
      },
    }
  );

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  });

  return { success: true };
}
