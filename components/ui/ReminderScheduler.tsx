"use client";

import { useEffect } from "react";
import { APP_NAME } from "@/lib/config";
import { playGentleChime } from "@/lib/chime";
import { copyFor, nextOccurrence, type ReminderType } from "@/lib/scheduling";
import { useSettings } from "@/lib/hooks";
import { showToast } from "@/lib/toast";

export function ReminderScheduler() {
  const { remindersEnabled, reminderTimes } = useSettings();
  // Stable string key: a focus revalidation that returns identical times won't
  // re-run the effect (and needlessly reset every timer).
  const timesKey = JSON.stringify(reminderTimes);

  useEffect(() => {
    if (!remindersEnabled) return;
    const times = JSON.parse(timesKey) as Record<ReminderType, string>;
    const timers: ReturnType<typeof setTimeout>[] = [];

    function schedule(type: ReminderType) {
      const hhmm = times[type];
      if (!hhmm) return;
      const delay = nextOccurrence(hhmm).getTime() - Date.now();
      timers.push(
        setTimeout(() => {
          const text = copyFor(type);
          playGentleChime();
          if (
            document.hidden &&
            typeof Notification !== "undefined" &&
            Notification.permission === "granted"
          ) {
            new Notification(APP_NAME, { body: text, icon: "/icons/icon-192.png" });
          } else {
            showToast(text);
          }
          schedule(type); // re-arm for the next day while the tab stays open
        }, delay),
      );
    }

    (Object.keys(times) as ReminderType[]).forEach(schedule);
    return () => timers.forEach(clearTimeout);
  }, [remindersEnabled, timesKey]);

  return null;
}
