"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import { useIsNightMode, useSettings } from "@/lib/hooks";

const PARTICLE_BY_THEME: Record<string, string> = {
  lavender: "🌸",
  peach: "🌼",
  mint: "🍃",
  cloud: "☁️",
  moonlight: "✨",
};

/** Small drifting theme-flavored particles for ambient depth behind tab content. */
export function ThemeParticles() {
  const settings = useSettings();
  const isNight = useIsNightMode(settings.dayStartHour);
  const reduce = useReducedMotion();
  const glyph = PARTICLE_BY_THEME[settings.palette] ?? "✨";

  const particles = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        left: 8 + ((i * 17) % 90),
        duration: 16 + (i % 4) * 4,
        delay: i * 1.7,
        size: 14 + (i % 3) * 6,
      })),
    [],
  );

  if (isNight || reduce) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <motion.span
          key={`${settings.palette}-${p.id}`}
          className="absolute select-none"
          style={{
            left: `${p.left}%`,
            fontSize: p.size,
            opacity: 0.75,
            filter: "drop-shadow(0 0 6px color-mix(in srgb, var(--color-accent-1) 70%, white))",
          }}
          initial={{ y: "110vh", opacity: 0 }}
          animate={{ y: "-10vh", opacity: [0, 0.75, 0.75, 0] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {glyph}
        </motion.span>
      ))}
    </div>
  );
}
