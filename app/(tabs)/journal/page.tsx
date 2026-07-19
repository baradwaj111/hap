"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { FireflyJar } from "@/components/firefly-jar/FireflyJar";
import promptsData from "@/data/prompts.json";
import { addJournalEntry, type JournalEntry } from "@/lib/db";
import { formatFriendlyDate, formatMonthLabel, monthKey } from "@/lib/date";
import { useAllJournal, useSettings } from "@/lib/hooks";

const prompts = promptsData as string[];

export default function JournalPage() {
  const settings = useSettings();
  const entries = useAllJournal();
  const [text, setText] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [openEntry, setOpenEntry] = useState<JournalEntry | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  async function handleSave() {
    const trimmed = text.trim();
    if (!trimmed) return;
    await addJournalEntry(trimmed, settings.dayStartHour, selectedPrompt ?? undefined);
    setText("");
    setSelectedPrompt(null);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1800);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? entries.filter((e) => e.text.toLowerCase().includes(q)) : entries;
  }, [entries, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, JournalEntry[]>();
    for (const e of filtered) {
      const key = monthKey(e.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  return (
    <main className="flex flex-col gap-4 px-4 pb-6 pt-6 md:pt-4">
      <div>
        <p className="eyebrow">Your fireflies</p>
        <h1 className="font-display mt-1 text-2xl md:text-3xl">Journal</h1>
      </div>

      <FireflyJar entries={entries} onSelect={setOpenEntry} />

      <div className="card p-5">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="whatever's on your mind, no pressure to make it tidy"
          rows={4}
          className="focus-ring w-full resize-none rounded-2xl border-none px-3.5 py-3 text-sm"
          style={{ background: "var(--color-bg)" }}
        />

        <div className="mt-3 flex flex-wrap gap-2">
          {prompts.slice(0, 6).map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPrompt(p === selectedPrompt ? null : p)}
              className="btn-squish focus-ring flex min-h-11 items-center rounded-full px-3 py-1.5 text-xs"
              style={{
                background:
                  selectedPrompt === p ? "var(--color-accent-1)" : "var(--color-accent-3)",
              }}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={handleSave}
            disabled={!text.trim()}
            className="btn-squish focus-ring rounded-2xl px-4 py-2.5 text-sm disabled:opacity-40"
            style={{ background: "var(--color-accent-2)" }}
          >
            Save this thought ✨
          </button>
          <AnimatePresence>
            {justSaved && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-muted"
              >
                a new firefly joined the jar 🐣
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {entries.length > 0 && (
        <>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search your thoughts"
            className="focus-ring card px-3.5 py-2.5 text-sm"
          />

          <div className="flex flex-col gap-4">
            {grouped.map(([key, monthEntries]) => (
              <div key={key}>
                <h2 className="mb-2 text-xs font-medium text-muted">{formatMonthLabel(key)}</h2>
                <div className="flex flex-col gap-2">
                  {monthEntries
                    .sort((a, b) => b.at - a.at)
                    .map((entry) => (
                      <button
                        key={entry.id}
                        onClick={() => setOpenEntry(entry)}
                        className="btn-squish focus-ring card p-3.5 text-left"
                      >
                        <p className="text-xs text-muted">{formatFriendlyDate(entry.date)}</p>
                        <p className="mt-1 line-clamp-2 text-sm">{entry.text}</p>
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <AnimatePresence>
        {openEntry && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenEntry(null)}
          >
            <motion.div
              className="card m-4 w-full max-w-sm p-5"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-xs text-muted">{formatFriendlyDate(openEntry.date)}</p>
              {openEntry.promptUsed && (
                <p className="mt-1 text-xs italic text-muted">prompt: {openEntry.promptUsed}</p>
              )}
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{openEntry.text}</p>
              <button
                onClick={() => setOpenEntry(null)}
                className="btn-squish focus-ring mt-4 w-full rounded-2xl py-2.5 text-sm"
                style={{ background: "var(--color-accent-1)" }}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
