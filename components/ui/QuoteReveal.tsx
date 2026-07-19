"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import type { Quote } from "@/lib/content";

const SPARKLES = ["✨", "💫", "🌟"];

function SparkleBurst({ seed }: { seed: string }) {
  const particles = useMemo(() => {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    return Array.from({ length: 10 }, (_, i) => {
      const angle = (i / 10) * Math.PI * 2 + ((h >> i) % 10) / 10;
      const distance = 70 + ((h >> (i + 3)) % 50);
      return {
        id: i,
        glyph: SPARKLES[(h >> (i + 1)) % SPARKLES.length],
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        delay: (i % 5) * 0.03,
      };
    });
  }, [seed]);

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute text-lg"
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.75, delay: p.delay, ease: "easeOut" }}
        >
          {p.glyph}
        </motion.span>
      ))}
    </div>
  );
}

export function QuoteReveal({ quote, children }: { quote: Quote; children: React.ReactNode }) {
  const reduce = useReducedMotion();

  if (reduce) return <>{children}</>;

  return (
    <div className="relative" style={{ perspective: 1200 }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={quote.text}
          initial={{ rotateY: 90, opacity: 0, scale: 0.85 }}
          animate={{ rotateY: 0, opacity: 1, scale: 1 }}
          exit={{ rotateY: -90, opacity: 0, scale: 0.85 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {children}
          <SparkleBurst seed={quote.text} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
