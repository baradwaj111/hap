"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import { useIsNightMode, useSettings } from "@/lib/hooks";

function hashN(seed: number): number {
  let h = seed;
  h = (h * 2654435761) >>> 0;
  h ^= h >>> 15;
  return h;
}

const STAR_COUNT = 130;

// Each travels bottom-left -> top-right (southwest -> northeast). startLeft/
// startTop place it off-screen near the bottom-left edge; rotate points the
// streak's bright head along that same diagonal so it reads as one line of
// motion rather than a sideways-drifting rectangle.
const SHOOTING_STARS = [
  { startLeft: "-8%", startTop: "92%", rotate: -52, delay: 2, duration: 1.3, repeatDelay: 8 },
  { startLeft: "8%", startTop: "108%", rotate: -40, delay: 6, duration: 1.1, repeatDelay: 11 },
  { startLeft: "-4%", startTop: "70%", rotate: -60, delay: 10, duration: 1.5, repeatDelay: 9 },
  { startLeft: "20%", startTop: "115%", rotate: -35, delay: 14, duration: 1.2, repeatDelay: 13 },
  { startLeft: "-12%", startTop: "50%", rotate: -65, delay: 19, duration: 1.4, repeatDelay: 10 },
] as const;

function ShootingStar({
  startLeft,
  startTop,
  rotate,
  delay,
  duration,
  repeatDelay,
}: {
  startLeft: string;
  startTop: string;
  rotate: number;
  delay: number;
  duration: number;
  repeatDelay: number;
}) {
  return (
    <motion.div
      className="absolute h-[2px] w-24 rounded-full"
      style={{
        left: startLeft,
        top: startTop,
        rotate,
        background: "linear-gradient(90deg, transparent, #fff8e0 65%, #ffffff)",
        filter: "drop-shadow(0 0 4px #fff8e0)",
      }}
      initial={{ x: "0vw", y: "0vh", opacity: 0 }}
      animate={{ x: "115vw", y: "-140vh", opacity: [0, 1, 1, 0] }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatDelay,
        ease: "easeIn",
        times: [0, 0.1, 0.75, 1],
      }}
    />
  );
}

/** Full-screen night backdrop: deep gradient sky + twinkling stars + the odd
 * shooting star. Self-gates on useIsNightMode, so callers can mount it
 * unconditionally alongside AmbientBackdrop / ThemeParticles. */
export function NightSky() {
  const settings = useSettings();
  const isNight = useIsNightMode(settings.dayStartHour);
  const reduce = useReducedMotion();

  const stars = useMemo(
    () =>
      Array.from({ length: STAR_COUNT }, (_, i) => {
        const h1 = hashN(i * 17 + 3);
        const h2 = hashN(i * 31 + 11);
        const h3 = hashN(i * 53 + 7);
        return {
          left: (h1 % 1000) / 10,
          top: (h2 % 1000) / 10,
          size: 1 + (h3 % 250) / 100,
          delay: (h2 % 400) / 100,
          duration: 2 + (h3 % 300) / 100,
        };
      }),
    [],
  );

  if (!isNight) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, #050914 0%, #0b1330 45%, #131d4a 100%)" }}
      />
      {stars.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            boxShadow: `0 0 ${s.size * 2.5}px rgba(255, 255, 255, 0.85)`,
          }}
          animate={reduce ? {} : { opacity: [0.55, 1, 0.55] }}
          transition={{ duration: s.duration, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
        />
      ))}
      {!reduce && SHOOTING_STARS.map((s, i) => <ShootingStar key={i} {...s} />)}
    </div>
  );
}
