"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import nourishIdeas from "@/data/nourish-ideas.json";
import { addMealCheck, updateMealNote, type MealSlot, type MealStatus } from "@/lib/db";
import { useTodayMeals } from "@/lib/hooks";

const SLOTS: { key: MealSlot; label: string; hint: string }[] = [
  { key: "morning", label: "After waking", hint: "~3pm" },
  { key: "afternoon", label: "Mid-shift", hint: "~7:30pm" },
  { key: "evening", label: "Late", hint: "~11pm" },
];

const STATUS_OPTIONS: { key: MealStatus; label: string }[] = [
  { key: "yes", label: "Yes 😊" },
  { key: "small", label: "Something small 🍪" },
  { key: "notYet", label: "Not yet 🥺" },
];

function pickIdeas(count: number): string[] {
  const shuffled = [...nourishIdeas].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function NourishmentRow({ dayStartHour }: { dayStartHour: number }) {
  const meals = useTodayMeals(dayStartHour);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [ideasFor, setIdeasFor] = useState<MealSlot | null>(null);
  const [ideas, setIdeas] = useState<string[]>([]);

  const latestBySlot = (slot: MealSlot) =>
    meals.filter((m) => m.slot === slot).sort((a, b) => b.at - a.at)[0];

  async function handleChoose(slot: MealSlot, status: MealStatus) {
    const entry = await addMealCheck(slot, status, dayStartHour);
    if (status === "notYet") {
      setIdeas(pickIdeas(5));
      setIdeasFor(slot);
    }
    void entry;
  }

  async function handleNoteBlur(id: string) {
    const note = noteDrafts[id]?.trim();
    if (note) await updateMealNote(id, note);
  }

  return (
    <div className="card-tint-3 p-5">
      <p className="eyebrow">Nourishment</p>
      <h2 className="font-display mt-0.5 text-lg">Have you had something nourishing?</h2>
      <div className="mt-4 flex flex-col">
        {SLOTS.map((slot, i) => {
          const existing = latestBySlot(slot.key);
          return (
            <div
              key={slot.key}
              className="py-3"
              style={
                i > 0
                  ? { borderTop: "1px solid color-mix(in srgb, var(--color-ink) 8%, transparent)" }
                  : undefined
              }
            >
              <p className="text-xs text-muted">
                {slot.label} <span className="opacity-70">· {slot.hint}</span>
              </p>
              {existing ? (
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span className="text-sm">
                    {STATUS_OPTIONS.find((s) => s.key === existing.status)?.label}
                  </span>
                  <button
                    className="focus-ring text-xs text-muted underline underline-offset-2"
                    onClick={() =>
                      setNoteDrafts((d) => ({ ...d, [existing.id]: d[existing.id] ?? existing.note ?? "" }))
                    }
                  >
                    {existing.note ? "edit note" : "add a note"}
                  </button>
                  {noteDrafts[existing.id] !== undefined && (
                    <input
                      autoFocus
                      value={noteDrafts[existing.id]}
                      onChange={(e) =>
                        setNoteDrafts((d) => ({ ...d, [existing.id]: e.target.value }))
                      }
                      onBlur={() => handleNoteBlur(existing.id)}
                      placeholder="what did you have? (optional)"
                      className="focus-ring mt-1 w-full rounded-xl border-none px-2.5 py-1.5 text-sm"
                      style={{ background: "var(--color-surface)" }}
                    />
                  )}
                </div>
              ) : (
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => handleChoose(slot.key, opt.key)}
                      className="btn-squish focus-ring flex min-h-11 items-center rounded-full px-3 py-1.5 text-sm"
                      style={{ background: "var(--color-surface)" }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {ideasFor && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIdeasFor(null)}
          >
            <motion.div
              className="card m-4 w-full max-w-sm p-5"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-display text-lg">some soft ideas, only if you want</p>
              <ul className="mt-3 flex flex-col gap-2 text-sm">
                {ideas.map((idea) => (
                  <li key={idea} className="rounded-xl px-3 py-2" style={{ background: "var(--color-bg)" }}>
                    {idea}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setIdeasFor(null)}
                className="btn-squish focus-ring mt-4 w-full rounded-2xl py-2.5 text-sm"
                style={{ background: "var(--color-accent-1)" }}
              >
                Okay 🌷
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
