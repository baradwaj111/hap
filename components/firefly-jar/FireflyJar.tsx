"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import type { JournalEntry } from "@/lib/db";

interface FireflyJarProps {
  entries: JournalEntry[];
  onSelect: (entry: JournalEntry) => void;
}

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

// Fireflies are seeded across the jar's body (below the shoulder) and then
// clipped to the jar silhouette, so nothing ever floats outside the glass.
const JAR_X = [50, 170];
const JAR_Y = [72, 172];

function positionFor(id: string) {
  const h = hashId(id);
  const x = JAR_X[0] + (h % 1000) / 1000 * (JAR_X[1] - JAR_X[0]);
  const y = JAR_Y[0] + ((h >> 10) % 1000) / 1000 * (JAR_Y[1] - JAR_Y[0]);
  const duration = 3 + ((h >> 20) % 1000) / 1000 * 3;
  const dx = 6 + ((h >> 4) % 10);
  const dy = 8 + ((h >> 7) % 10);
  return { x, y, duration, dx, dy };
}

const MAX_VISIBLE = 60;

// A mason-jar silhouette: narrow neck, curved shoulders, straight body, rounded bottom.
const JAR_PATH =
  "M85 18 L135 18 L135 42 C150 42 178 48 178 68 L178 168 C178 177 171 182 160 182 L60 182 C49 182 42 177 42 168 L42 68 C42 48 70 42 85 42 Z";

export function FireflyJar({ entries, onSelect }: FireflyJarProps) {
  const reduce = useReducedMotion();
  const visible = useMemo(() => entries.slice(0, MAX_VISIBLE), [entries]);

  return (
    <div className="card p-4">
      <svg
        viewBox="0 0 220 210"
        className="w-full rounded-2xl"
        style={{ background: "var(--color-bg)" }}
        role="img"
        aria-label="The firefly jar"
      >
        <defs>
          <radialGradient id="fireflyGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-attention)" stopOpacity="1" />
            <stop offset="35%" stopColor="var(--color-attention)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--color-attention)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="jarGlass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-accent-1)" stopOpacity="0.28" />
            <stop offset="55%" stopColor="var(--color-surface)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--color-accent-4)" stopOpacity="0.28" />
          </linearGradient>
          <clipPath id="jarClip">
            <path d={JAR_PATH} />
          </clipPath>
        </defs>

        {/* shore */}
        <ellipse cx="110" cy="198" rx="95" ry="9" fill="var(--color-accent-4)" opacity="0.5" />

        {/* lid */}
        <rect x="78" y="6" width="64" height="16" rx="5" fill="var(--color-accent-3)" stroke="var(--color-ink)" strokeOpacity="0.15" />
        <rect x="78" y="17" width="64" height="4" rx="2" fill="var(--color-ink)" opacity="0.12" />

        {/* jar body */}
        <path
          d={JAR_PATH}
          fill="url(#jarGlass)"
          stroke="var(--color-ink)"
          strokeOpacity="0.35"
          strokeWidth="2.5"
        />
        {/* neck rim ridges, mason-jar detail */}
        <path d="M87 30 H133" stroke="var(--color-ink)" strokeOpacity="0.2" strokeWidth="1.5" />
        <path d="M85 36 H135" stroke="var(--color-ink)" strokeOpacity="0.2" strokeWidth="1.5" />
        {/* glass highlight */}
        <path
          d="M54 72 C54 110 54 140 54 160"
          stroke="var(--color-surface)"
          strokeOpacity="0.7"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        <g clipPath="url(#jarClip)" style={{ mixBlendMode: "screen" }}>
          {visible.map((entry) => {
            const { x, y, duration, dx, dy } = positionFor(entry.id);
            return (
              <motion.g
                key={entry.id}
                animate={
                  reduce
                    ? {}
                    : {
                        x: [0, dx, -dx * 0.6, 0],
                        y: [0, -dy, dy * 0.5, 0],
                        opacity: [0.6, 1, 0.7, 0.6],
                      }
                }
                transition={{ duration, repeat: reduce ? 0 : Infinity, ease: "easeInOut" }}
                style={{ cursor: "pointer" }}
                onClick={() => onSelect(entry)}
                role="button"
                tabIndex={0}
                aria-label={`Reopen journal entry from ${entry.date}`}
                onKeyDown={(e) => e.key === "Enter" && onSelect(entry)}
              >
                <circle cx={x} cy={y} r="13" fill="url(#fireflyGlow)" />
                <circle cx={x} cy={y} r="2.8" fill="var(--color-attention)" />
                <circle cx={x} cy={y} r="1.1" fill="var(--color-surface)" />
              </motion.g>
            );
          })}
        </g>
      </svg>

      {entries.length === 0 && (
        <p className="mt-2 text-center text-sm text-muted">
          no fireflies yet — your first thought can be tiny
        </p>
      )}
      {entries.length > 0 && (
        <p className="mt-2 text-center text-xs text-muted">
          {entries.length} {entries.length === 1 ? "firefly" : "fireflies"} in the jar
        </p>
      )}
    </div>
  );
}
