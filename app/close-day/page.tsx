"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Duck } from "@/components/mascot/Duck";
import { Sky } from "@/components/sky/Sky";
import { buildDaySummary, closeDay, type MealSlot, type MealStatus } from "@/lib/db";
import { formatFriendlyDate } from "@/lib/date";
import { useIsDayClosed, useSettings, useStarCount, useTodayKey } from "@/lib/hooks";

const SLOT_LABELS: Record<MealSlot, string> = {
  morning: "After waking",
  afternoon: "Mid-shift",
  evening: "Late",
};
const STATUS_LABELS: Record<MealStatus, string> = {
  yes: "Yes 😊",
  small: "Something small 🍪",
  notYet: "Not yet 🥺",
};
const WEATHER_ICONS: Record<string, string> = {
  sunny: "☀️",
  cloudy: "⛅",
  rainy: "🌧️",
  stormy: "⛈️",
  rainbow: "🌈",
};

export default function CloseDayPage() {
  const router = useRouter();
  const settings = useSettings();
  const todayKey = useTodayKey(settings.dayStartHour);
  const alreadyClosed = useIsDayClosed(todayKey);
  const starCount = useStarCount();
  const [releasing, setReleasing] = useState(false);

  const summary = useLiveQuery(
    () => buildDaySummary(todayKey, settings.waterGoalMl),
    [todayKey, settings.waterGoalMl],
  );

  async function handleClose() {
    setReleasing(true);
    await closeDay(todayKey, settings.waterGoalMl);
    setTimeout(() => router.push("/today"), 2600);
  }

  if (alreadyClosed && !releasing) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <Duck state="idle" />
        <p className="font-display text-xl">Today&apos;s already tucked in 🌙</p>
        <p className="max-w-xs text-sm text-muted">
          You already closed today gently. Come back tomorrow, I&apos;ll be here.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-4 pb-10 pt-8 md:max-w-xl md:px-6 md:pt-12">
      <h1 className="font-display text-2xl">Close the day</h1>
      <p className="text-sm text-muted">{formatFriendlyDate(todayKey)}</p>

      <div className="card relative overflow-hidden p-5">
        <div className="relative flex h-40 items-center justify-center">
          <Duck state="idle" />
          <AnimatePresence>
            {releasing && (
              <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
                initial={{ y: 0, opacity: 1, scale: 0.9 }}
                animate={{ y: -220, opacity: [1, 1, 0], scale: 1 }}
                transition={{ duration: 2.4, ease: "easeOut" }}
              >
                <div
                  className="h-10 w-8 rounded-lg"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 30%, var(--color-attention), transparent 70%), var(--color-accent-3)",
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {summary && (
        <div className="card flex flex-col gap-4 p-5">
          <div>
            <p className="text-xs text-muted">water</p>
            <p className="text-sm">
              {summary.waterMl}ml of {summary.waterGoalMl}ml — every sip counted
            </p>
          </div>

          {summary.meals.length > 0 && (
            <div>
              <p className="text-xs text-muted">nourishment</p>
              <ul className="mt-1 flex flex-col gap-0.5 text-sm">
                {summary.meals.map((m, i) => (
                  <li key={i}>
                    {SLOT_LABELS[m.slot]}: {STATUS_LABELS[m.status]}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {summary.weatherStrip.length > 0 && (
            <div>
              <p className="text-xs text-muted">weather</p>
              <p className="mt-1 text-lg">
                {summary.weatherStrip.map((w, i) => (
                  <span key={i}>{WEATHER_ICONS[w]}</span>
                ))}
              </p>
            </div>
          )}

          <div>
            <p className="text-xs text-muted">fireflies</p>
            <p className="text-sm">
              {summary.fireflyCount === 0
                ? "none tonight, and that's okay"
                : `${summary.fireflyCount} new ${summary.fireflyCount === 1 ? "firefly" : "fireflies"} in the jar`}
            </p>
          </div>

          {summary.lastJournalLine && (
            <div>
              <p className="text-xs text-muted">something you wrote</p>
              <p className="mt-1 text-sm italic">&ldquo;{summary.lastJournalLine}&rdquo;</p>
            </div>
          )}
        </div>
      )}

      <p className="font-display px-2 text-center text-lg leading-snug">
        You showed up for yourself today. That counts. It always counts.
      </p>

      <Sky starCount={starCount} />

      {!releasing ? (
        <button
          onClick={handleClose}
          className="btn-squish focus-ring card p-4 text-center"
          style={{ background: "var(--color-accent-3)" }}
        >
          <span className="font-display text-lg">Close the day 🏮</span>
        </button>
      ) : (
        <p className="text-center text-sm text-muted">watching the lantern drift up...</p>
      )}
    </main>
  );
}
