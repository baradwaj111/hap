import { format, subHours } from "date-fns";

/**
 * Her day runs dayStartHour -> dayStartHour (default 06:00), not midnight -> midnight.
 * So 00:30 still belongs to the day that started the previous calendar morning —
 * water/meals/mood logged just after her shift never split across a midnight boundary.
 */
export function getAdjustedDateKey(date: Date, dayStartHour: number): string {
  return format(subHours(date, dayStartHour), "yyyy-MM-dd");
}

export function getTodayKey(dayStartHour: number): string {
  return getAdjustedDateKey(new Date(), dayStartHour);
}

export type ClockPhase = "wake" | "day" | "evening" | "lateNight" | "asleep";

/** Purely a function of the literal clock hour — greetings speak to the moment, not the adjusted day. */
export function getClockPhase(date: Date = new Date()): ClockPhase {
  const h = date.getHours();
  if (h >= 13 && h < 17) return "wake";
  if (h >= 17 && h < 22) return "day";
  if (h >= 22 || h < 2) return "evening";
  if (h >= 2 && h < 6) return "lateNight";
  return "asleep"; // 06:00-13:00, her sleep window
}

export function monthKey(dateKey: string): string {
  return dateKey.slice(0, 7); // yyyy-MM
}

export function formatMonthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return format(new Date(y, m - 1, 1), "MMMM yyyy");
}

export function formatFriendlyDate(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return format(new Date(y, m - 1, d), "EEEE, MMM d");
}
