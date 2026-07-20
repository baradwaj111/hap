"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import { useIsNightMode, useSettings } from "@/lib/hooks";

function hashN(seed: number): number {
  let h = seed;
  h = (h * 2654435761) >>> 0;
  // `^` coerces to a SIGNED int32 in JS — without the trailing >>> 0, half of
  // these come back negative, which turned into negative left/top percentages
  // and pushed those stars off-screen (the "empty left side" bug).
  h = (h ^ (h >>> 15)) >>> 0;
  return h;
}

const STAR_COUNT = 200;

// Travel distance in vmin (not vw/vh) so the real pixel length is identical
// on both axes regardless of window aspect ratio — otherwise a wide desktop
// window stretches x relative to y and the actual travel path ends up
// shallower than the streak's own drawn angle (they must share one angle).
const TRAVEL_VMIN = 220;

// Each travels bottom-left -> top-right (southwest -> northeast) at `angle`
// degrees above horizontal. startLeft/startTop place it off-screen near the
// bottom-left edge; rotate is derived from the same angle as the motion
// vector so the streak's bright head always points exactly along its path.
const SHOOTING_STARS = [
  { startLeft: "-8%", startTop: "92%", angle: 52, delay: 2, duration: 1.3, repeatDelay: 8 },
  { startLeft: "8%", startTop: "108%", angle: 40, delay: 6, duration: 1.1, repeatDelay: 11 },
  { startLeft: "-4%", startTop: "70%", angle: 60, delay: 10, duration: 1.5, repeatDelay: 9 },
  { startLeft: "20%", startTop: "115%", angle: 35, delay: 14, duration: 1.2, repeatDelay: 13 },
  { startLeft: "-12%", startTop: "50%", angle: 65, delay: 19, duration: 1.4, repeatDelay: 10 },
].map((s) => {
  const rad = (s.angle * Math.PI) / 180;
  return {
    ...s,
    rotate: -s.angle,
    dx: `${(TRAVEL_VMIN * Math.cos(rad)).toFixed(1)}vmin`,
    dy: `${(-TRAVEL_VMIN * Math.sin(rad)).toFixed(1)}vmin`,
  };
});

function ShootingStar({
  startLeft,
  startTop,
  rotate,
  dx,
  dy,
  delay,
  duration,
  repeatDelay,
}: {
  startLeft: string;
  startTop: string;
  rotate: number;
  dx: string;
  dy: string;
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
      initial={{ x: 0, y: 0, opacity: 0 }}
      animate={{ x: dx, y: dy, opacity: [0, 1, 1, 0] }}
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
