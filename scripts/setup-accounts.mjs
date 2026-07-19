// One-time setup: creates the two Supabase Auth accounts + profile rows.
// Usage:
//   ADMIN_USERNAME=... ADMIN_PASSWORD=... HER_USERNAME=... HER_PASSWORD=... HER_DISPLAY_NAME=... \
//     node scripts/setup-accounts.mjs
//
// Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");
for (const line of readFileSync(envPath, "utf8").split("\n")) {
  const match = line.match(/^([A-Z_]+)=(.*)$/);
  if (match) process.env[match[1]] ??= match[2];
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const {
  ADMIN_USERNAME,
  ADMIN_PASSWORD,
  HER_USERNAME,
  HER_PASSWORD,
  HER_DISPLAY_NAME = "her",
} = process.env;

if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !HER_USERNAME || !HER_PASSWORD) {
  console.error(
    "Set ADMIN_USERNAME, ADMIN_PASSWORD, HER_USERNAME, HER_PASSWORD env vars before running.",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Must match lib/username.ts's usernameToEmail()
function usernameToEmail(username) {
  return `${username.trim().toLowerCase().replace(/\s+/g, "")}@hap.local`;
}

async function createAccount(username, password, role, displayName) {
  const email = usernameToEmail(username);
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) {
    console.error(`Failed to create ${role} account (${username}):`, error.message);
    process.exit(1);
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .insert({ id: data.user.id, role, display_name: displayName });
  if (profileError) {
    console.error(`Created auth user but failed to insert profile for ${username}:`, profileError.message);
    process.exit(1);
  }

  console.log(`✓ Created ${role} account: username="${username}"`);
}

await createAccount(ADMIN_USERNAME, ADMIN_PASSWORD, "admin", "admin");
await createAccount(HER_USERNAME, HER_PASSWORD, "user", HER_DISPLAY_NAME);

console.log("\nDone. Both accounts are ready to log in with their username + password.");
