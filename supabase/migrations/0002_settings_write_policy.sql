-- "Only I get to see the Settings page" is enforced by routing (proxy.ts +
-- nav), not by database ACLs on every key. Several settings are actually
-- per-device runtime state written automatically during her normal usage
-- (notification permission, usage count, which memes she's already seen) —
-- those writes were being rejected because the original policy only allowed
-- the admin role to write. Widen writes to any authenticated account; the
-- Settings *page* itself stays admin-only via the app, same as before.

drop policy if exists "only admin can write settings" on settings;

create policy "any signed-in account can write settings"
  on settings for insert
  with check (auth.role() = 'authenticated');

create policy "any signed-in account can update settings"
  on settings for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
