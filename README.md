# Hap 🐥

A gentle, local-first daily companion PWA. A soft daily check-in — mood as weather, water as
a pond, journal entries as fireflies — with a panic-support mode ("Hold My Hand") always one
tap away.

Everything lives in IndexedDB on the device. No accounts, no backend, no analytics, no runtime
network calls. Installable and fully usable offline.

## Personalize before deploying

Everything below is a placeholder. Replace it before sharing the link.

1. **Her name, reminder times, water goal** — defaults live in [`lib/config.ts`](lib/config.ts).
   These are only first-run defaults; she can also change them anytime in Settings.
2. **Notes from your person** — [`data/person-notes.json`](data/person-notes.json). 15 entries,
   each marked `"REPLACE_ME": true`. Shown one at a time in Hold My Hand → Notes.
3. **A letter for you** — the `LETTER_TEXT` constant at the top of
   [`app/letter/page.tsx`](app/letter/page.tsx), marked `REPLACE_ME`.
4. **Helplines** — defaults in `lib/config.ts` (`DEFAULT_HELPLINES`), India-focused. The
   `"Call your person"` entry has a placeholder phone number — fill in yours. She can also edit
   the whole list from Settings → Support helplines (stored per-device from then on).
5. **Memes** — drop image files (`.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`) into
   [`public/memes/`](public/memes/). Run `npm run scan-memes` (or just `npm run dev` /
   `npm run build`, which do this automatically) to regenerate `data/memes.json`. The "a little
   something for you" card only appears once this list isn't empty, and never repeats a meme
   until the folder has cycled through.
6. **App icon / mascot face** — generated from [`public/icons/icon-source.svg`](public/icons/icon-source.svg).
   Edit that file and re-run `node scripts/generate-icons.mjs` (needs `sharp`, already a
   transitive dependency) to regenerate `app/icon.png`, `app/apple-icon.png`, and the manifest
   icons in `public/icons/`.

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech

Next.js (App Router) + TypeScript + Tailwind v4 + Framer Motion + Dexie (IndexedDB) + date-fns.
No `next-pwa` — the service worker at [`public/sw.js`](public/sw.js) is hand-rolled (network-first
for navigations, cache-first-with-revalidate for static assets) so it doesn't depend on a
webpack plugin under Turbopack.

## Deploying to Vercel

1. Push this repo to GitHub (or any git host Vercel supports).
2. In Vercel, "Add New Project" → import the repo. No environment variables are needed.
3. Framework preset: Next.js (auto-detected). Build command / output: defaults are fine.
4. Deploy. That's it — it's a fully static-ish app with no server-side secrets.

Every visitor gets their own empty IndexedDB, so there's nothing to seed server-side. Data
never leaves her device — a Vercel deploy is just serving static files + a service worker.

## v2 TODO (not built — intentionally out of scope for v1)

Real background push notifications (firing even when the app/browser is fully closed) need a
server. v1 only schedules reminders for the rest of the current day while the app happens to be
open (tab visible or not), via `setTimeout` in [`components/ui/ReminderScheduler.tsx`](components/ui/ReminderScheduler.tsx) —
this keeps the app 100% backend-free and offline-first. For real push:

- Add `web-push` + a stored `PushSubscription` per device (would need a tiny KV store —
  Vercel KV or similar — since this is otherwise backend-free).
- A Vercel Cron job checks each device's reminder times and calls `web-push.sendNotification`.
- This reintroduces a server dependency, so it's deliberately deferred rather than built half-way.

## Acceptance checklist

- [x] Full daily loop (check in → water → close the day) is a handful of taps, no required fields
- [x] Hold My Hand is one tap from every screen (a floating heart, present everywhere except the
      Hold My Hand screen itself) and works fully offline once the service worker has cached it
- [x] No calories, weight, streak-loss, or guilt copy anywhere (grepped clean)
- [x] Fonts self-hosted via `next/font`; zero runtime network calls anywhere in the app
- [x] Export/import round-trips every table (`lib/db.ts` → `exportBackup` / `importBackup`)
- [x] Reduced-motion respected everywhere, including a text-count fallback for the breathing circle
- [x] Every empty state (empty firefly jar, empty sky, no memes yet) has a kind line, not a blank
- [x] AA text contrast — `--muted` was darkened per-theme to clear 4.5:1 against its backgrounds
