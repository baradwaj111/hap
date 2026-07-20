"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useIsNightMode, useSettings } from "@/lib/hooks";

const BLOBS = [
  { color: "var(--color-accent-1)", top: "-10%", left: "-15%", size: "55vmax", duration: 26 },
  { color: "var(--color-accent-2)", top: "40%", left: "70%", size: "50vmax", duration: 32 },
  { color: "var(--color-accent-4)", top: "75%", left: "5%", size: "45vmax", duration: 29 },
] as const;

/** Slow-drifting blurred color blobs behind tab content, for depth without noise. */
export function AmbientBackdrop() {
  const reduce = useReducedMotion();
  const settings = useSettings();
  const isNight = useIsNightMode(settings.dayStartHour);

  if (isNight) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {BLOBS.map((blob, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            top: blob.top,
            left: blob.left,
            width: blob.size,
            height: blob.size,
            background: blob.color,
            opacity: 0.28,
            filter: "blur(70px)",
          }}
          animate={
            reduce
              ? {}
              : {
                  x: [0, 40, -20, 0],
                  y: [0, -30, 20, 0],
                  scale: [1, 1.08, 0.96, 1],
                }
          }
          transition={{ duration: blob.duration, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
