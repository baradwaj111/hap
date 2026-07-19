"use client";

import { useMemo, useState } from "react";
import { MemeSurprise } from "@/components/ui/MemeSurprise";
import { QuoteReveal } from "@/components/ui/QuoteReveal";
import { getQuoteOfDay, getRandomQuote, type Quote, type QuoteCategory } from "@/lib/content";
import { useSettings, useTodayKey } from "@/lib/hooks";
import { saveQuoteAsImage } from "@/lib/shareImage";

const CATEGORIES: { key: QuoteCategory; label: string }[] = [
  { key: "hope", label: "Hope" },
  { key: "healing", label: "Healing" },
  { key: "self-trust", label: "Self-trust" },
  { key: "worthiness", label: "Worthiness" },
  { key: "gentle-strength", label: "Gentle strength" },
  { key: "soft-days", label: "Soft days" },
];

function QuoteCard({ quote, tint = false }: { quote: Quote; tint?: boolean }) {
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await saveQuoteAsImage(quote);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={tint ? "card-tint-2 p-5" : "card p-5"}>
      <p className="font-display text-lg leading-snug">&ldquo;{quote.text}&rdquo;</p>
      {quote.author && <p className="mt-2 text-xs text-muted">— {quote.author}</p>}
      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-squish focus-ring mt-3 flex min-h-11 items-center rounded-full px-3 py-1.5 text-xs disabled:opacity-50"
        style={{ background: tint ? "var(--color-surface)" : "var(--color-accent-3)" }}
      >
        {saving ? "saving..." : "Save as image 🖼️"}
      </button>
    </div>
  );
}

export default function HopePage() {
  const settings = useSettings();
  const todayKey = useTodayKey(settings.dayStartHour);
  const quoteOfDay = useMemo(() => getQuoteOfDay(todayKey), [todayKey]);
  const [category, setCategory] = useState<QuoteCategory | null>(null);
  const [pickedQuote, setPickedQuote] = useState<Quote | null>(null);

  function pickCategory(key: QuoteCategory) {
    if (key === category) {
      setCategory(null);
      setPickedQuote(null);
      return;
    }
    setCategory(key);
    setPickedQuote(getRandomQuote(undefined, key));
  }

  function shuffle() {
    if (!category) return;
    setPickedQuote((prev) => getRandomQuote(prev?.text, category));
  }

  return (
    <main className="flex flex-col gap-5 px-4 pb-6 pt-6 md:pt-4">
      <div>
        <p className="eyebrow">Quotes & gentle surprises</p>
        <h1 className="font-display mt-1 text-2xl md:text-3xl">Hope Corner</h1>
      </div>

      <div>
        <p className="eyebrow mb-2">Today&apos;s quote</p>
        <QuoteCard quote={quoteOfDay} tint />
      </div>

      <MemeSurprise />

      <div>
        <p className="eyebrow mb-2">Browse by feeling</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => pickCategory(c.key)}
              className="btn-squish focus-ring flex min-h-11 items-center rounded-full px-3.5 py-1.5 text-sm"
              style={{
                background: category === c.key ? "var(--color-accent-1)" : "var(--color-surface)",
                border: "1px solid color-mix(in srgb, var(--color-ink) 8%, transparent)",
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {category && pickedQuote && (
        <div className="flex flex-col gap-3">
          <QuoteReveal quote={pickedQuote}>
            <QuoteCard quote={pickedQuote} tint />
          </QuoteReveal>
          <button
            onClick={shuffle}
            className="btn-squish focus-ring mx-auto flex min-h-11 items-center rounded-full px-4 py-2 text-sm"
            style={{ background: "var(--color-accent-2)" }}
          >
            Show me another ✨
          </button>
        </div>
      )}
    </main>
  );
}
