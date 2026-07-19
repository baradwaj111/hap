/** Supabase Auth is email-based; we present "username" in the UI and map it
 * to a synthetic email deterministically. Must match scripts/setup-accounts.mjs. */
export function usernameToEmail(username: string): string {
  return `${username.trim().toLowerCase().replace(/\s+/g, "")}@hap.local`;
}
