"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

function hashN(seed: number): number {
  let h = seed;
  h = (h * 2654435761) >>> 0;
  h ^= h >>> 15;
  return h;
}

export function Sky({ starCount, height = 160 }: { starCount: number; height?: number }) {
  const reduce = useReducedMotion();
  const stars = useMemo(
    () =>
      Array.from({ length: starCount }, (_, i) => {
        const h1 = hashN(i * 17 + 3);
        const h2 = hashN(i * 31 + 11);
        return {
          x: (h1 % 1000) / 10,
          y: (h2 % 1000) / 10,
          r: 1 + (h1 % 300) / 300,
          delay: (h2 % 400) / 100,
        };
      }),
    [starCount],
  );

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{
        height,
        background: "linear-gradient(180deg, #1c1830 0%, #2c2450 100%)",
      }}
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
        {stars.map((s, i) => (
          <motion.circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="#F6EFDA"
            animate={reduce ? {} : { opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
          />
        ))}
      </svg>
      {starCount === 0 && (
        <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-white/70">
          no stars yet — your first closed day will add one
        </p>
      )}
    </div>
  );
}
