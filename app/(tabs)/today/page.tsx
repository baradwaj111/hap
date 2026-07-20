"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import type { DuckState } from "@/components/mascot/Duck";
import { HopeCard } from "@/components/ui/HopeCard";
import { MoodPicker } from "@/components/ui/MoodPicker";
import { NourishmentRow } from "@/components/ui/NourishmentRow";
import { WaterJar } from "@/components/water-jar/WaterJar";
import { addWaterLog, undoLastWaterLog } from "@/lib/db";
import { formatFriendlyDate, getClockPhase } from "@/lib/date";
import {
  useIsDayClosed,
  useLastWeather,
  useSettings,
  useTodayKey,
  useTodayWater,
} from "@/lib/hooks";

function useGreeting(herName: string) {
  const phase = getClockPhase();
  switch (phase) {
    case "wake":
      return { text: `Good morning, ${herName} 🌤️`, duckState: "idle" as DuckState };
    case "day":
      return { text: `hi, ${herName} 🌷`, duckState: "idle" as DuckState };
    case "evening":
      return { text: `Good evening, ${herName} 🌙`, duckState: "idle" as DuckState };
    case "lateNight":
      return { text: `still up? I'm here with you 🌙`, duckState: "sleepy" as DuckState };
    default:
      return { text: `sleep well, ${herName} 💤 I'll be here when you wake`, duckState: "sleepy" as DuckState };
  }
}

/** Reads the one-shot ?hug=1 flag left by Hold My Hand. Isolated so only this
 * sliver needs a Suspense boundary for useSearchParams. */
function HugFlagWatcher({ onHug }: { onHug: () => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("hug") === "1") {
      onHug();
      router.replace("/today");
    }
  }, [searchParams, router, onHug]);

  return null;
}

export default function TodayPage() {
  const settings = useSettings();
  const todayKey = useTodayKey(settings.dayStartHour);
  const { totalMl, logs } = useTodayWater(settings.dayStartHour);
  const weather = useLastWeather(settings.dayStartHour);
  const dayClosed = useIsDayClosed(todayKey);
  const { text: greeting, duckState: phaseDuckState } = useGreeting(settings.herName);

  const [hugUntil, setHugUntil] = useState(0);
  const [showAftercare, setShowAftercare] = useState(false);

  const handleHug = useCallback(() => {
    setHugUntil(Date.now() + 3000);
    setShowAftercare(true);
  }, []);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const duckState: DuckState = now < hugUntil ? "hug" : phaseDuckState;

  const rawHour = new Date().getHours();
  const inCloseWindow = rawHour >= 0 && rawHour < settings.dayStartHour;
  const showCloseCta = inCloseWindow && !dayClosed;

  return (
    <main className="flex flex-col gap-5 px-4 pb-6 pt-6 md:pt-4">
      <Suspense fallback={null}>
        <HugFlagWatcher onHug={handleHug} />
      </Suspense>

      <div
        className="-mx-4 px-4 pb-2 pt-2 md:mx-0 md:rounded-3xl md:px-6 md:pt-6"
        style={{
          background:
            "linear-gradient(160deg, color-mix(in srgb, var(--color-accent-1) 26%, transparent) 0%, transparent 65%)",
        }}
      >
        <p className="eyebrow">{formatFriendlyDate(todayKey)}</p>
        <h1 className="font-display mt-1 text-2xl leading-snug md:text-3xl">{greeting}</h1>
      </div>

      {showAftercare && (
        <div className="card-tint-2 flex items-center justify-between gap-3 p-4">
          <div className="flex flex-wrap gap-3 text-sm">
            <a href="#water-widget" className="underline underline-offset-2">
              a sip of water?
            </a>
            <a href="#mood-picker" className="underline underline-offset-2">
              want to note how you feel?
            </a>
          </div>
          <button
            onClick={() => setShowAftercare(false)}
            aria-label="Dismiss"
            className="focus-ring text-muted"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div id="water-widget">
          <WaterJar
            totalMl={totalMl}
            goalMl={settings.waterGoalMl}
            hasLogs={logs.length > 0}
            baseDuckState={duckState}
            weather={weather}
            onAdd={(ml) => addWaterLog(ml, settings.dayStartHour)}
            onUndo={() => undoLastWaterLog(settings.dayStartHour)}
          />
        </div>

        <NourishmentRow dayStartHour={settings.dayStartHour} />

        <div className="grid grid-cols-2 items-stretch gap-4">
          <HopeCard dateKey={todayKey} />
          <div id="mood-picker">
            <MoodPicker dayStartHour={settings.dayStartHour} />
          </div>
        </div>
      </div>

      {showCloseCta && (
        <Link
          href="/close-day"
          className="btn-squish focus-ring flex items-center justify-center gap-2 rounded-3xl p-4 text-center"
          style={{
            background:
              "linear-gradient(135deg, var(--color-accent-3), var(--color-accent-2))",
          }}
        >
          <span className="font-display text-lg">Close your day? 🏮</span>
        </Link>
      )}
    </main>
  );
}
