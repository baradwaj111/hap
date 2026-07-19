import notificationCopy from "@/data/notification-copy.json";
import type { Settings } from "./db";

export type ReminderType = "hydration1" | "hydration2" | "hydration3" | "eat1" | "eat2";

/** The next time `hh:mm` occurs — today if it's still ahead, otherwise tomorrow.
 * This keeps every reminder in the future, so a time that's already passed
 * (or a late-night one) fires at its next occurrence instead of being dropped. */
export function nextOccurrence(hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  if (d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);
  return d;
}

/** All reminders with their next fire time. There's no push server in v1, so a
 * reminder only fires while a tab is open at that moment — see ReminderScheduler. */
export function getUpcomingReminders(settings: Settings): { type: ReminderType; at: Date }[] {
  return (Object.entries(settings.reminderTimes) as [ReminderType, string][]).map(
    ([type, hhmm]) => ({ type, at: nextOccurrence(hhmm) }),
  );
}

export function copyFor(type: ReminderType): string {
  const bank = notificationCopy as Record<string, string[]>;
  const family = type.replace(/\d+$/, ""); // hydration1 -> hydration, eat2 -> eat
  const list = bank[family] ?? bank.generic;
  return list[Math.floor(Math.random() * list.length)];
}
