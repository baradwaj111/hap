"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BreathingCircle, type BreathingPattern } from "@/components/breathing-circle/BreathingCircle";
import { Duck } from "@/components/mascot/Duck";
import personNotes from "@/data/person-notes.json";
import reassurances from "@/data/reassurances.json";
import { logPanicSession } from "@/lib/db";
import { useSettings } from "@/lib/hooks";

type Step = "arrival" | "breathing" | "grounding" | "reassurance" | "notes" | "support";
const STEP_ORDER: Step[] = ["arrival", "breathing", "grounding", "reassurance", "notes", "support"];

const SENSES: { verb: string; count: number }[] = [
  { verb: "see", count: 5 },
  { verb: "touch", count: 4 },
  { verb: "hear", count: 3 },
  { verb: "smell", count: 2 },
  { verb: "taste", count: 1 },
];

const GROUNDING_STEPS = SENSES.flatMap((s) =>
  Array.from({ length: s.count }, (_, i) => ({ verb: s.verb, index: i + 1, total: s.count })),
);

function ExitButton({ onExit }: { onExit: () => void }) {
  return (
    <button
      onClick={onExit}
      className="btn-squish focus-ring fixed inset-x-4 bottom-6 z-50 mx-auto max-w-xs rounded-2xl py-3.5 text-center text-base shadow-lg sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2"
      style={{ background: "var(--color-surface)", color: "var(--color-ink)" }}
    >
      I&apos;m okay now 💗
    </button>
  );
}

export default function HoldMyHandPage() {
  const router = useRouter();
  const settings = useSettings();
  const startRef = useRef(Date.now());
  const [step, setStep] = useState<Step>("arrival");
  const [pattern, setPattern] = useState<BreathingPattern>("box");
  const [groundIndex, setGroundIndex] = useState(0);
  const [reassuranceIndex, setReassuranceIndex] = useState(0);
  const [noteIndex, setNoteIndex] = useState(0);

  useEffect(() => {
    if (step !== "reassurance") return;
    const id = setInterval(() => {
      setReassuranceIndex((i) => (i + 1) % reassurances.length);
    }, 6000);
    return () => clearInterval(id);
  }, [step]);

  const stepPos = STEP_ORDER.indexOf(step);

  function goNext() {
    const next = STEP_ORDER[stepPos + 1];
    if (next) setStep(next);
    else endSession();
  }

  function endSession() {
    const durationSec = Math.round((Date.now() - startRef.current) / 1000);
    void logPanicSession(durationSec, settings.dayStartHour);
    router.push("/today?hug=1");
  }

  const reassurance = reassurances[reassuranceIndex];
  const note = personNotes[noteIndex] as { text: string; REPLACE_ME?: boolean };

  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center px-6 pb-28 pt-10 text-center"
      style={{ background: "var(--color-bg)" }}
    >
      <AnimatePresence mode="wait">
        {step === "arrival" && (
          <motion.div
            key="arrival"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <motion.div
              className="h-40 w-40 rounded-full"
              style={{ background: "var(--color-accent-1)", opacity: 0.5 }}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <p className="font-display max-w-xs text-2xl leading-snug">
              I&apos;m here. You&apos;re safe right now. Let&apos;s breathe together.
            </p>
            <button
              onClick={goNext}
              className="btn-squish focus-ring rounded-2xl px-6 py-3 text-sm"
              style={{ background: "var(--color-accent-2)" }}
            >
              Okay, let&apos;s begin
            </button>
          </motion.div>
        )}

        {step === "breathing" && (
          <motion.div
            key="breathing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="flex gap-2">
              <button
                onClick={() => setPattern("box")}
                className="btn-squish focus-ring flex min-h-11 items-center rounded-full px-3.5 py-1.5 text-xs"
                style={{ background: pattern === "box" ? "var(--color-accent-1)" : "var(--color-surface)" }}
              >
                Box breathing 4-4-4-4
              </button>
              <button
                onClick={() => setPattern("478")}
                className="btn-squish focus-ring flex min-h-11 items-center rounded-full px-3.5 py-1.5 text-xs"
                style={{ background: pattern === "478" ? "var(--color-accent-1)" : "var(--color-surface)" }}
              >
                4-7-8
              </button>
            </div>
            <BreathingCircle pattern={pattern} />
            <button onClick={goNext} className="focus-ring text-sm text-muted underline underline-offset-2">
              Skip ahead
            </button>
          </motion.div>
        )}

        {step === "grounding" && (
          <motion.div
            key={`grounding-${groundIndex}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-col items-center gap-5"
          >
            <p className="text-xs text-muted">
              grounding · {groundIndex + 1} of {GROUNDING_STEPS.length}
            </p>
            <p className="font-display max-w-xs text-2xl leading-snug">
              Name something you can {GROUNDING_STEPS[groundIndex].verb}
              <span className="block text-base text-muted">
                ({GROUNDING_STEPS[groundIndex].index} of {GROUNDING_STEPS[groundIndex].total})
              </span>
            </p>
            <button
              onClick={() => {
                if (groundIndex + 1 < GROUNDING_STEPS.length) setGroundIndex(groundIndex + 1);
                else goNext();
              }}
              className="btn-squish focus-ring rounded-2xl px-6 py-3 text-sm"
              style={{ background: "var(--color-accent-2)" }}
            >
              Found it
            </button>
            <button onClick={goNext} className="focus-ring text-sm text-muted underline underline-offset-2">
              Skip ahead
            </button>
          </motion.div>
        )}

        {step === "reassurance" && (
          <motion.div
            key="reassurance"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={reassuranceIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-display max-w-xs text-2xl leading-snug"
              >
                {reassurance}
              </motion.p>
            </AnimatePresence>
            <button onClick={goNext} className="focus-ring text-sm text-muted underline underline-offset-2">
              Continue
            </button>
          </motion.div>
        )}

        {step === "notes" && (
          <motion.div
            key="notes"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <p className="text-xs text-muted">from your favourite person 💌</p>
            <AnimatePresence mode="wait">
              <motion.div
                key={noteIndex}
                initial={{ opacity: 0, rotate: -2 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 2 }}
                className="card max-w-xs p-6"
              >
                <p className="font-display text-lg leading-snug">{note.text}</p>
              </motion.div>
            </AnimatePresence>
            <div className="flex gap-3">
              {noteIndex + 1 < personNotes.length && (
                <button
                  onClick={() => setNoteIndex(noteIndex + 1)}
                  className="btn-squish focus-ring rounded-2xl px-4 py-2.5 text-sm"
                  style={{ background: "var(--color-accent-2)" }}
                >
                  Another note
                </button>
              )}
              <button onClick={goNext} className="focus-ring text-sm text-muted underline underline-offset-2">
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {step === "support" && (
          <motion.div
            key="support"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex w-full max-w-sm flex-col items-center gap-4"
          >
            <p className="max-w-xs text-sm text-muted">
              Talking to a professional is one of the bravest kinds of self-care.
            </p>
            <div className="flex w-full flex-col gap-2">
              {settings.helplines.map((h) => (
                <a
                  key={h.label}
                  href={`tel:${h.phone}`}
                  className="btn-squish focus-ring card flex items-center justify-between px-4 py-3 text-sm"
                >
                  <span>{h.label}</span>
                  <span className="text-muted">{h.phone.startsWith("REPLACE") ? "add number" : h.phone}</span>
                </a>
              ))}
            </div>
            <button onClick={goNext} className="focus-ring text-sm text-muted underline underline-offset-2">
              I&apos;m ready to go back
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-10 opacity-70">
        <Duck state="hug" size={90} />
      </div>

      <ExitButton onExit={endSession} />
    </main>
  );
}
