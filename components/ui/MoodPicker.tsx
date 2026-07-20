"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { addMood, updateMoodNote, type Weather } from "@/lib/db";
import { useTodayMoods } from "@/lib/hooks";

const WEATHERS: { key: Weather; icon: string; label: string }[] = [
  { key: "sunny", icon: "☀️", label: "sunny" },
  { key: "cloudy", icon: "⛅", label: "cloudy" },
  { key: "rainy", icon: "🌧️", label: "rainy" },
  { key: "stormy", icon: "⛈️", label: "stormy" },
  { key: "rainbow", icon: "🌈", label: "something good happened" },
];

export function MoodPicker({ dayStartHour }: { dayStartHour: number }) {
  const moods = useTodayMoods(dayStartHour);
  const [noteDraft, setNoteDraft] = useState<{ id: string; text: string } | null>(null);
  const [showStormOffer, setShowStormOffer] = useState(false);

  async function handlePick(weather: Weather) {
    const entry = await addMood(weather, dayStartHour);
    if (weather === "stormy") setShowStormOffer(true);
    setNoteDraft({ id: entry.id, text: "" });
  }

  async function saveNote() {
    if (noteDraft && noteDraft.text.trim()) {
      await updateMoodNote(noteDraft.id, noteDraft.text.trim());
    }
    setNoteDraft(null);
  }

  return (
    <div className="card-tint-4 flex h-full flex-col p-5">
      <p className="eyebrow">Mood</p>
      <h2 className="font-display mt-0.5 text-lg">How&apos;s the weather in there?</h2>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {WEATHERS.map((w) => (
          <button
            key={w.key}
            onClick={() => handlePick(w.key)}
            aria-label={w.label}
            className="btn-squish focus-ring flex h-11 w-11 items-center justify-center rounded-2xl text-xl"
            style={{ background: "var(--color-surface)" }}
          >
            {w.icon}
          </button>
        ))}
      </div>

      {moods.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1 text-lg" aria-label="today's weather strip">
          {moods
            .sort((a, b) => a.at - b.at)
            .map((m) => (
              <span key={m.id}>{WEATHERS.find((w) => w.key === m.weather)?.icon}</span>
            ))}
        </div>
      )}

      {noteDraft && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
          <input
            autoFocus
            value={noteDraft.text}
            onChange={(e) => setNoteDraft({ ...noteDraft, text: e.target.value })}
            onBlur={saveNote}
            onKeyDown={(e) => e.key === "Enter" && saveNote()}
            placeholder="want to say why? (optional)"
            className="focus-ring w-full rounded-xl border-none px-3 py-2 text-sm"
            style={{ background: "var(--color-bg)" }}
          />
        </motion.div>
      )}

      <AnimatePresence>
        {showStormOffer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden rounded-2xl p-3"
            style={{ background: "var(--color-accent-2)" }}
          >
            <p className="text-sm">I&apos;m right here. Want me to hold your hand for a minute?</p>
            <div className="mt-2 flex gap-2">
              <Link
                href="/hold-my-hand"
                className="btn-squish focus-ring flex min-h-11 items-center rounded-full px-3 py-1.5 text-sm"
                style={{ background: "var(--color-surface)" }}
              >
                Yes, please 💗
              </Link>
              <button
                onClick={() => setShowStormOffer(false)}
                className="focus-ring flex min-h-11 items-center rounded-full px-3 py-1.5 text-sm text-muted"
              >
                Not right now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
