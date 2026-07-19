import { createBrowserClient } from "@supabase/ssr";

// Keep her logged in for a month at a stretch instead of re-prompting for
// credentials — this is a 2-person household app, not a banking session.
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookieOptions: { maxAge: SESSION_MAX_AGE_SECONDS } },
  );
}
