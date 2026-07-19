"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Duck, type DuckState } from "@/components/mascot/Duck";
import type { Weather } from "@/lib/db";
import { getClockPhase } from "@/lib/date";

interface WaterJarProps {
  totalMl: number;
  goalMl: number;
  onAdd: (ml: number) => void;
  onUndo: () => void;
  hasLogs: boolean;
  baseDuckState: DuckState;
  weather?: Weather;
}

const TAP_TARGETS = [
  { ml: 150, label: "Glass", icon: "🥛" },
  { ml: 250, label: "Cup", icon: "☕" },
  { ml: 500, label: "Bottle", icon: "🍶" },
] as const;

export function WaterJar({
  totalMl,
  goalMl,
  onAdd,
  onUndo,
  hasLogs,
  baseDuckState,
  weather,
}: WaterJarProps) {
  const [ripples, setRipples] = useState<{ id: number; x: number }[]>([]);
  const [justLogged, setJustLogged] = useState(false);

  const percent = Math.min(1, goalMl > 0 ? totalMl / goalMl : 0);
  const reachedGoal = totalMl >= goalMl;
  const phase = getClockPhase();
  const isEveningLow = (phase === "evening" || phase === "lateNight") && percent < 0.5;

  function handleAdd(ml: number) {
    onAdd(ml);
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 1200);
    // event handler, not render — a fresh ripple id/position per tap is expected
    /* eslint-disable react-hooks/purity -- event handler, not render */
    const id = Date.now();
    const x = 30 + Math.random() * 40;
    /* eslint-enable react-hooks/purity */
    setRipples((prev) => [...prev, { id, x }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 1200);
  }

  const duckState: DuckState = justLogged ? "happy" : baseDuckState;
  const duckLift = percent * 22; // duck floats higher as the pond fills

  return (
    <div className="card p-5">
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{ height: 180, background: "var(--color-bg)" }}
      >
        {/* water fill */}
        <motion.div
          className="absolute inset-x-0 bottom-0"
          style={{
            background:
              "linear-gradient(180deg, var(--color-accent-1) 0%, var(--color-accent-4) 100%)",
            opacity: 0.55,
            borderTopLeftRadius: "50% 18px",
            borderTopRightRadius: "50% 18px",
          }}
          animate={{ height: `${18 + percent * 72}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />

        <AnimatePresence>
          {ripples.map((r) => (
            <motion.div
              key={r.id}
              className="absolute rounded-full border-2"
              style={{
                left: `${r.x}%`,
                bottom: `${18 + percent * 72}%`,
                borderColor: "var(--color-surface)",
                width: 10,
                height: 10,
                marginLeft: -5,
              }}
              initial={{ scale: 0.5, opacity: 0.8 }}
              animate={{ scale: 6, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          ))}
        </AnimatePresence>

        <motion.div
          className="absolute inset-x-0 bottom-6 flex justify-center"
          animate={{ y: -duckLift }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Duck state={duckState} weather={weather} size={128} />
        </motion.div>

        {reachedGoal && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full px-3 py-1 text-xs"
            style={{ background: "var(--color-surface)", color: "var(--color-ink)" }}
          >
            ✨
          </motion.div>
        )}
      </div>

      <p className="mt-3 text-center text-sm text-muted">
        {reachedGoal
          ? "Look at you, all hydrated and glowing ✨"
          : isEveningLow
            ? "There's still time for a few sips 💧"
            : `${totalMl}ml of ${goalMl}ml — no pressure, just noticing`}
      </p>

      <div className="mt-4 flex items-center justify-center gap-3">
        {TAP_TARGETS.map((t) => (
          <button
            key={t.ml}
            onClick={() => handleAdd(t.ml)}
            className="btn-squish focus-ring flex flex-col items-center gap-1 rounded-2xl px-4 py-2.5 text-sm"
            style={{ background: "var(--color-accent-1)", color: "var(--color-ink)" }}
          >
            <span className="text-lg" aria-hidden>
              {t.icon}
            </span>
            +{t.ml}ml
          </button>
        ))}
      </div>

      {hasLogs && (
        <button
          onClick={onUndo}
          className="focus-ring btn-squish mx-auto mt-3 block text-xs text-muted underline underline-offset-2"
        >
          Undo last sip
        </button>
      )}
    </div>
  );
}
