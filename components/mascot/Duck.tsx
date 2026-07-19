"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Weather } from "@/lib/db";

export type DuckState = "idle" | "happy" | "sleepy" | "hug";

interface DuckProps {
  state?: DuckState;
  weather?: Weather;
  size?: number;
  className?: string;
}

export function Duck({ state = "idle", weather, size = 160, className }: DuckProps) {
  const reduce = useReducedMotion();

  const bobAnimation = reduce
    ? {}
    : state === "sleepy"
      ? { y: [0, -2, 0] }
      : state === "idle"
        ? { y: [0, -6, 0] }
        : {};

  const bobTransition = state === "sleepy" ? 5 : 3;

  const bodyRotate =
    state === "happy" && !reduce
      ? { rotate: [0, -4, 4, -2, 0] }
      : state === "idle" && !reduce
        ? { rotate: [0, -2, 2, 0] }
        : { rotate: 0 };

  const bodyRotateTransition =
    state === "happy" ? { duration: 0.6, ease: "easeInOut" as const } : { duration: 6, repeat: Infinity, ease: "easeInOut" as const };

  const showUmbrella = weather === "rainy" || weather === "stormy";
  const showSunglasses = weather === "sunny";

  return (
    <svg
      viewBox="0 0 200 160"
      width={size}
      height={size * 0.8}
      className={className}
      role="img"
      aria-label={`Your duck companion, feeling ${state}`}
    >
      <defs>
        <linearGradient id="pond" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-accent-4)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--color-accent-1)" stopOpacity="0.35" />
        </linearGradient>
      </defs>

      <ellipse cx="100" cy="140" rx="95" ry="16" fill="url(#pond)" />
      {!reduce && (
        <motion.ellipse
          cx="100"
          cy="140"
          rx="60"
          ry="8"
          fill="var(--color-surface)"
          opacity="0.25"
          animate={{ rx: [55, 70, 55], opacity: [0.25, 0.1, 0.25] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <motion.g
        animate={{ ...bobAnimation, ...bodyRotate }}
        transition={{
          y: { duration: bobTransition, repeat: reduce ? 0 : Infinity, ease: "easeInOut" },
          rotate: bodyRotateTransition,
        }}
        style={{ transformOrigin: "100px 110px" }}
      >
        {/* body */}
        <ellipse cx="100" cy="112" rx="46" ry="34" fill="var(--color-accent-3)" />

        {/* wings */}
        <motion.path
          d="M70 108 Q50 112 58 130 Q72 128 78 112 Z"
          fill="color-mix(in srgb, var(--color-accent-3) 70%, var(--color-ink) 10%)"
          animate={
            state === "hug" && !reduce
              ? { rotate: [0, -35, -35, 0] }
              : { rotate: 0 }
          }
          transition={{ duration: 1.4, times: [0, 0.4, 0.8, 1] }}
          style={{ transformOrigin: "70px 112px" }}
        />
        <motion.path
          d="M130 108 Q150 112 142 130 Q128 128 122 112 Z"
          fill="color-mix(in srgb, var(--color-accent-3) 70%, var(--color-ink) 10%)"
          animate={
            state === "hug" && !reduce ? { rotate: [0, 35, 35, 0] } : { rotate: 0 }
          }
          transition={{ duration: 1.4, times: [0, 0.4, 0.8, 1] }}
          style={{ transformOrigin: "130px 112px" }}
        />

        {/* head */}
        <circle cx="76" cy="76" r="30" fill="var(--color-accent-3)" />

        {/* blush cheek */}
        <circle cx="66" cy="86" r="6" fill="var(--color-accent-2)" opacity="0.7" />

        {/* beak */}
        <path d="M50 78 Q34 80 50 88 Q56 84 58 78 Z" fill="var(--color-attention)" />

        {/* eye */}
        {state === "sleepy" ? (
          <path d="M68 70 Q76 76 84 70" stroke="var(--color-ink)" strokeWidth="3" fill="none" strokeLinecap="round" />
        ) : (
          <motion.g
            animate={reduce ? {} : { scaleY: [1, 1, 0.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, times: [0, 0.9, 0.95, 1] }}
            style={{ transformOrigin: "76px 70px" }}
          >
            <circle cx="76" cy="70" r="4.5" fill="var(--color-ink)" />
          </motion.g>
        )}

        {showSunglasses && (
          <g>
            <rect x="64" y="65" width="24" height="10" rx="5" fill="var(--color-ink)" opacity="0.85" />
          </g>
        )}
      </motion.g>

      {showUmbrella && (
        <g>
          <line x1="150" y1="60" x2="150" y2="110" stroke="var(--color-muted)" strokeWidth="2" />
          <path
            d="M120 60 Q150 30 180 60 Z"
            fill="var(--color-accent-2)"
            stroke="var(--color-surface)"
            strokeWidth="1.5"
          />
        </g>
      )}
    </svg>
  );
}
