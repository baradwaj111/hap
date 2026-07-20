"use client";

import Link from "next/link";
import { useState } from "react";
import { APP_NAME, PALETTES } from "@/lib/config";
import { playGentleChime } from "@/lib/chime";
import { addMemeLink, removeMemeLink, setSetting } from "@/lib/db";
import { classifyMemeUrl } from "@/lib/memeEmbed";
import { signOut, useMemeLinks, useSettings } from "@/lib/hooks";

const REMINDER_FIELDS: { key: keyof ReturnType<typeof useSettings>["reminderTimes"]; label: string }[] = [
  { key: "hydration1", label: "Hydration nudge (1)" },
  { key: "hydration2", label: "Hydration nudge (2)" },
  { key: "hydration3", label: "Hydration nudge (3)" },
  { key: "eat1", label: "Eat something (1)" },
  { key: "eat2", label: "Eat something (2)" },
];

export default function SettingsPage() {
  const settings = useSettings();
  const memeLinks = useMemeLinks();
  const [memeUrl, setMemeUrl] = useState("");
  const [memeError, setMemeError] = useState<string | null>(null);
  const [notifStatus, setNotifStatus] = useState<string | null>(null);

  async function handleTestNotification() {
    if (typeof Notification === "undefined") {
      setNotifStatus("This browser doesn't support notifications.");
      return;
    }

    let permission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
    }

    if (permission !== "granted") {
      setNotifStatus(
        "Permission is blocked. Enable it via the 🔒 icon in the address bar, and check System Settings → Notifications for your browser.",
      );
      return;
    }

    setNotifStatus("Sending in 3 seconds — switch to another tab or window to see it pop up...");
    setTimeout(() => {
      playGentleChime();
      new Notification(APP_NAME, {
        body: "test successful — this is what her reminders will look like 🫧",
        icon: "/icons/icon-192.png",
      });
      setNotifStatus("Sent! If nothing appeared, check System Settings → Notifications → your browser.");
    }, 3000);
  }

  function updateReminderTime(key: string, value: string) {
    void setSetting("reminderTimes", { ...settings.reminderTimes, [key]: value });
  }

  function updateHelpline(index: number, field: "label" | "phone", value: string) {
    const next = settings.helplines.map((h, i) => (i === index ? { ...h, [field]: value } : h));
    void setSetting("helplines", next);
  }

  function addHelpline() {
    void setSetting("helplines", [...settings.helplines, { label: "New helpline", phone: "" }]);
  }

  function removeHelpline(index: number) {
    void setSetting("helplines", settings.helplines.filter((_, i) => i !== index));
  }

  async function handleAddMeme() {
    const kind = classifyMemeUrl(memeUrl);
    if (!kind) {
      setMemeError("That doesn't look like an Instagram or YouTube link.");
      return;
    }
    setMemeError(null);
    await addMemeLink(memeUrl.trim(), kind);
    setMemeUrl("");
  }

  return (
    <main className="flex flex-col gap-5 px-4 pb-6 pt-6 md:pt-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Configure Hap</p>
          <h1 className="font-display mt-1 text-2xl md:text-3xl">Settings</h1>
        </div>
        <button
          onClick={() => signOut()}
          className="btn-squish focus-ring rounded-full px-3.5 py-1.5 text-sm md:hidden"
          style={{ background: "var(--color-accent-4)" }}
        >
          Log out
        </button>
      </div>

      <section className="card flex flex-col gap-3 p-5">
        <label className="text-sm">
          Her name
          <input
            defaultValue={settings.herName}
            onBlur={(e) => setSetting("herName", e.target.value || settings.herName)}
            className="focus-ring mt-1 w-full rounded-xl px-3 py-2 text-sm"
            style={{ background: "var(--color-bg)" }}
          />
        </label>

        <label className="text-sm">
          Water goal (ml)
          <input
            type="number"
            defaultValue={settings.waterGoalMl}
            onBlur={(e) => setSetting("waterGoalMl", Number(e.target.value) || settings.waterGoalMl)}
            className="focus-ring mt-1 w-full rounded-xl px-3 py-2 text-sm"
            style={{ background: "var(--color-bg)" }}
          />
        </label>

        <label className="text-sm">
          Her day starts at
          <input
            type="time"
            defaultValue={`${String(settings.dayStartHour).padStart(2, "0")}:00`}
            onBlur={(e) => {
              const hour = Number(e.target.value.split(":")[0]);
              if (!Number.isNaN(hour)) setSetting("dayStartHour", hour);
            }}
            className="focus-ring mt-1 w-full rounded-xl px-3 py-2 text-sm"
            style={{ background: "var(--color-bg)" }}
          />
        </label>
      </section>

      <section className="card flex flex-col gap-3 p-5">
        <p className="text-sm font-medium">Reminder times</p>
        {REMINDER_FIELDS.map((f) => (
          <label key={f.key} className="text-sm">
            {f.label}
            <input
              type="time"
              defaultValue={settings.reminderTimes[f.key]}
              onBlur={(e) => updateReminderTime(f.key, e.target.value)}
              className="focus-ring mt-1 w-full rounded-xl px-3 py-2 text-sm"
              style={{ background: "var(--color-bg)" }}
            />
          </label>
        ))}

        <div
          className="mt-1 flex flex-col gap-2 border-t pt-3"
          style={{ borderColor: "color-mix(in srgb, var(--color-ink) 8%, transparent)" }}
        >
          <button
            onClick={handleTestNotification}
            className="btn-squish focus-ring self-start rounded-2xl px-4 py-2.5 text-sm"
            style={{ background: "var(--color-accent-2)" }}
          >
            Send a test notification 🔔
          </button>
          {notifStatus && <p className="text-xs text-muted">{notifStatus}</p>}
        </div>
      </section>

      <section className="card flex flex-col gap-3 p-5">
        <p className="text-sm font-medium">Palette</p>
        <div className="flex flex-wrap gap-2">
          {PALETTES.map((p) => (
            <button
              key={p.id}
              onClick={() => setSetting("palette", p.id)}
              className="btn-squish focus-ring flex min-h-11 items-center rounded-full px-3.5 py-1.5 text-sm"
              style={{
                background: settings.palette === p.id ? "var(--color-accent-1)" : "var(--color-bg)",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>

      <section className="card flex flex-col gap-3 p-5">
        <p className="text-sm font-medium">Support helplines</p>
        <p className="text-xs text-muted">Shown in Hold My Hand. Edit or add your own.</p>
        {settings.helplines.map((h, i) => (
          <div key={i} className="flex gap-2">
            <input
              defaultValue={h.label}
              onBlur={(e) => updateHelpline(i, "label", e.target.value)}
              placeholder="label"
              className="focus-ring w-1/2 rounded-xl px-3 py-2 text-sm"
              style={{ background: "var(--color-bg)" }}
            />
            <input
              defaultValue={h.phone}
              onBlur={(e) => updateHelpline(i, "phone", e.target.value)}
              placeholder="phone"
              className="focus-ring w-1/3 rounded-xl px-3 py-2 text-sm"
              style={{ background: "var(--color-bg)" }}
            />
            <button
              onClick={() => removeHelpline(i)}
              aria-label="Remove"
              className="focus-ring flex min-h-11 min-w-11 items-center justify-center text-muted"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={addHelpline}
          className="btn-squish focus-ring flex min-h-11 items-center self-start rounded-full px-3 py-1.5 text-xs"
          style={{ background: "var(--color-accent-3)" }}
        >
          + add helpline
        </button>
      </section>

      <section className="card-tint-3 flex flex-col gap-3 p-5">
        <p className="text-sm font-medium">Memes of the day</p>
        <p className="text-xs text-muted">
          Paste an Instagram post/reel or YouTube video/short link. Everything you add here shows
          up in her Memes tab, newest first.
        </p>

        {memeLinks.length > 0 && (
          <ul className="flex flex-col gap-2">
            {memeLinks.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm"
                style={{ background: "var(--color-surface)" }}
              >
                <span className="truncate">
                  {m.kind === "instagram" ? "📸" : "▶️"} {m.url}
                </span>
                <button
                  onClick={() => removeMemeLink(m.id)}
                  aria-label="Remove"
                  className="focus-ring flex min-h-11 min-w-11 shrink-0 items-center justify-center text-muted"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2">
          <input
            value={memeUrl}
            onChange={(e) => setMemeUrl(e.target.value)}
            placeholder="https://instagram.com/reel/... or youtube.com/..."
            className="focus-ring w-full rounded-xl px-3 py-2 text-sm"
            style={{ background: "var(--color-surface)" }}
          />
          <button
            onClick={handleAddMeme}
            disabled={!memeUrl.trim()}
            className="btn-squish focus-ring shrink-0 rounded-xl px-3.5 py-2 text-sm disabled:opacity-50"
            style={{ background: "var(--color-surface)" }}
          >
            + Add
          </button>
        </div>
        {memeError && <p className="text-xs text-[var(--color-attention)]">{memeError}</p>}
      </section>

      <section className="card p-5" style={{ background: "var(--color-accent-4)" }}>
        <p className="text-sm font-medium">Privacy</p>
        <p className="mt-1.5 text-sm leading-relaxed">
          Her check-ins, mood, and journal are stored securely and scoped to her account only —
          your admin login can&apos;t read them. App settings like these are shared between both
          accounts.
        </p>
      </section>

      <Link href="/letter" className="btn-squish focus-ring card p-4 text-center">
        A letter for you 💌
      </Link>

      <Link href="/install" className="focus-ring text-center text-sm text-muted underline underline-offset-2">
        Add {APP_NAME} to your home screen
      </Link>

      <button
        onClick={() => signOut()}
        className="focus-ring hidden text-center text-sm text-muted underline underline-offset-2 md:block"
      >
        Log out
      </button>
    </main>
  );
}
