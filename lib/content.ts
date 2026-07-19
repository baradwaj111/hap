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

/** Deterministic per-day pick so the quote of the day stays stable on repeat visits. */
export function getQuoteOfDay(dateKey: string): Quote {
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
  }
  return QUOTES[hash % QUOTES.length];
}

export function getRandomQuote(excludeText?: string): Quote {
  const pool = excludeText ? QUOTES.filter((q) => q.text !== excludeText) : QUOTES;
  return pool[Math.floor(Math.random() * pool.length)];
}
