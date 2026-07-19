import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Keep her logged in for a month at a stretch instead of re-prompting for
// credentials — this is a 2-person household app, not a banking session.
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

/** Server-side client bound to the request's cookies — respects RLS as whoever is logged in. */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, { ...options, maxAge: SESSION_MAX_AGE_SECONDS }),
            );
          } catch {
            // called from a Server Component during render — the proxy
            // already refreshes the session, so this can be safely ignored
          }
        },
      },
    },
  );
}
