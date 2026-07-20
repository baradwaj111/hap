import quotesData from "@/data/quotes.json";

export type QuoteCategory =
  | "hope"
  | "healing"
  | "self-trust"
  | "worthiness"
  | "gentle-strength"
  | "soft-days";

export interface Quote {
  text: string;
  author?: string;
  category: QuoteCategory;
}

export const QUOTES = quotesData as Quote[];

/** One-off quote for a single date — shows instead of the deterministic pick
 * that day only, then falls back to normal rotation from the next day on. */
const QUOTE_OVERRIDES: Record<string, Quote> = {
  "2026-07-20": {
    text: "You deserve to receive love that isn't counted, compared, or conditional.",
    category: "worthiness",
  },
};

/** Deterministic per-day pick so the quote of the day stays stable on repeat visits. */
export function getQuoteOfDay(dateKey: string): Quote {
  if (QUOTE_OVERRIDES[dateKey]) return QUOTE_OVERRIDES[dateKey];
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
  }
  return QUOTES[hash % QUOTES.length];
}

export function getRandomQuote(excludeText?: string, category?: QuoteCategory): Quote {
  let pool = category ? QUOTES.filter((q) => q.category === category) : QUOTES;
  if (excludeText && pool.some((q) => q.text !== excludeText)) {
    pool = pool.filter((q) => q.text !== excludeText);
  }
  return pool[Math.floor(Math.random() * pool.length)];
}
