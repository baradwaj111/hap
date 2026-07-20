"use client";

import Link from "next/link";
import { getQuoteOfDay } from "@/lib/content";

export function HopeCard({ dateKey }: { dateKey: string }) {
  const quote = getQuoteOfDay(dateKey);

  return (
    <Link href="/hope" className="card-tint-2 btn-squish focus-ring flex h-full flex-col justify-center p-5">
      <p className="eyebrow">Today&apos;s hope corner</p>
      <p className="font-display mt-1.5 line-clamp-4 text-lg leading-snug">&ldquo;{quote.text}&rdquo;</p>
      {quote.author && <p className="mt-1 text-xs text-muted">— {quote.author}</p>}
    </Link>
  );
}
