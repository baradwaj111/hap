"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

export type BreathingPattern = "box" | "478";

interface Phase {
  label: string;
  sec: number;
  scale: number;
}

const PATTERNS: Record<BreathingPattern, Phase[]> = {
  box: [
    { label: "Breathe in", sec: 4, scale: 1.4 },
    { label: "Hold", sec: 4, scale: 1.4 },
    { label: "Breathe out", sec: 4, scale: 0.85 },
    { label: "Hold", sec: 4, scale: 0.85 },
  ],
  "478": [
    { label: "Breathe in", sec: 4, scale: 1.4 },
    { label: "Hold", sec: 7, scale: 1.4 },
    { label: "Breathe out", sec: 8, scale: 0.85 },
  ],
};

export function BreathingCircle({ pattern }: { pattern: BreathingPattern }) {
  const reduce = useReducedMotion();
  const phases = PATTERNS[pattern];
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(phases[0].sec);

  useEffect(() => {
    // resetting the phase cycle whenever she switches breathing pattern
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhaseIndex(0);
    setSecondsLeft(phases[0].sec);
  }, [pattern, phases]);

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s > 1) return s - 1;
        setPhaseIndex((i) => (i + 1) % phases.length);
        return phases[(phaseIndex + 1) % phases.length].sec;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phaseIndex, phases]);

  const current = phases[phaseIndex];

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative flex h-56 w-56 items-center justify-center">
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 160,
            height: 160,
            background: "var(--color-accent-1)",
            opacity: 0.5,
          }}
          animate={reduce ? {} : { scale: current.scale }}
          transition={{ duration: current.sec, ease: "easeInOut" }}
        />
        <div className="relative text-center">
          <p className="font-display text-xl">{current.label}</p>
          <p className="mt-1 text-3xl tabular-nums">{secondsLeft}</p>
        </div>
      </div>
    </div>
  );
}
