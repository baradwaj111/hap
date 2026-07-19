import { mutate } from "swr";
import { createClient } from "./supabase/client";
import {
  DEFAULT_DAY_START_HOUR,
  DEFAULT_HELPLINES,
  DEFAULT_PALETTE,
  DEFAULT_REMINDER_TIMES,
  DEFAULT_WATER_GOAL_ML,
  HER_NAME_DEFAULT,
  type PaletteId,
} from "./config";
import { getTodayKey } from "./date";

export interface WaterLog {
  id: string;
  date: string;
  ml: number;
  at: number;
}

export type MealSlot = "morning" | "afternoon" | "evening";
export type MealStatus = "yes" | "small" | "notYet";

export interface MealCheck {
  id: string;
  date: string;
  slot: MealSlot;
  status: MealStatus;
  note?: string;
  at: number;
}

export type Weather = "sunny" | "cloudy" | "rainy" | "stormy" | "rainbow";

export interface Mood {
  id: string;
  date: string;
  weather: Weather;
  note?: string;
  at: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  text: string;
  promptUsed?: string;
  at: number;
}

export interface DayClosedSummary {
  waterMl: number;
  waterGoalMl: number;
  meals: { slot: MealSlot; status: MealStatus }[];
  weatherStrip: Weather[];
  fireflyCount: number;
  lastJournalLine?: string;
}

export interface DayClosed {
  id: string;
  date: string;
  summarySnapshot: DayClosedSummary;
  at: number;
}

export interface PanicSession {
  id: string;
  date: string;
  durationSec: number;
  at: number;
}

export interface MemeLink {
  id: string;
  url: string;
  kind: "instagram" | "youtube";
  addedAt: string;
}

function makeId(): string {
  return crypto.randomUUID();
}

async function requireUserId(): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  return user.id;
}

// ---------- Settings ----------

export interface Settings {
  herName: string;
  dayStartHour: number;
  waterGoalMl: number;
  reminderTimes: typeof DEFAULT_REMINDER_TIMES;
  palette: PaletteId;
  notifPermission: NotificationPermission | "unset";
  remindersEnabled: boolean;
  hasSeenInstallPrompt: boolean;
  helplines: typeof DEFAULT_HELPLINES;
  nextMemeEligibleAt: number;
  shownMemeIds: string[];
  usageCount: number;
}

export const DEFAULT_SETTINGS: Settings = {
  herName: HER_NAME_DEFAULT,
  dayStartHour: DEFAULT_DAY_START_HOUR,
  waterGoalMl: DEFAULT_WATER_GOAL_ML,
  reminderTimes: DEFAULT_REMINDER_TIMES,
  palette: DEFAULT_PALETTE,
  notifPermission: "unset",
  remindersEnabled: false,
  hasSeenInstallPrompt: false,
  helplines: DEFAULT_HELPLINES,
  nextMemeEligibleAt: 0,
  shownMemeIds: [],
  usageCount: 0,
};

export async function getSetting<K extends keyof Settings>(key: K): Promise<Settings[K]> {
  const supabase = createClient();
  const { data } = await supabase.from("settings").select("value").eq("key", key).maybeSingle();
  return data ? (data.value as Settings[K]) : DEFAULT_SETTINGS[key];
}

export async function setSetting<K extends keyof Settings>(
  key: K,
  value: Settings[K],
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("settings").upsert({ key, value });
  if (error) throw error;
  void mutate("settings");
}

export async function getAllSettings(): Promise<Settings> {
  const supabase = createClient();
  const { data } = await supabase.from("settings").select("key, value");
  const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
  const merged = { ...DEFAULT_SETTINGS, ...map } as Settings;
  // reminderTimes is stored as one JSON blob, so a stored value replaces the
  // whole object — merge against defaults so newly added keys still resolve.
  merged.reminderTimes = { ...DEFAULT_REMINDER_TIMES, ...merged.reminderTimes };
  return merged;
}

// ---------- Water ----------

export async function addWaterLog(ml: number, dayStartHour: number) {
  const supabase = createClient();
  const user_id = await requireUserId();
  const row = { id: makeId(), user_id, date: getTodayKey(dayStartHour), ml, at: Date.now() };
  const { error } = await supabase.from("water_logs").insert(row);
  if (error) throw error;
  void mutate((key) => Array.isArray(key) && key[0] === "water_logs");
  return row;
}

export async function undoLastWaterLog(dayStartHour: number) {
  const supabase = createClient();
  const user_id = await requireUserId();
  const today = getTodayKey(dayStartHour);
  const { data } = await supabase
    .from("water_logs")
    .select("id")
    .eq("user_id", user_id)
    .eq("date", today)
    .order("at", { ascending: false })
    .limit(1);
  if (data?.[0]) await supabase.from("water_logs").delete().eq("id", data[0].id);
  void mutate((key) => Array.isArray(key) && key[0] === "water_logs");
}

// ---------- Meals ----------

export async function addMealCheck(
  slot: MealSlot,
  status: MealStatus,
  dayStartHour: number,
  note?: string,
) {
  const supabase = createClient();
  const user_id = await requireUserId();
  const row = {
    id: makeId(),
    user_id,
    date: getTodayKey(dayStartHour),
    slot,
    status,
    note,
    at: Date.now(),
  };
  const { error } = await supabase.from("meal_checks").insert(row);
  if (error) throw error;
  void mutate((key) => Array.isArray(key) && key[0] === "meal_checks");
  return row;
}

export async function updateMealNote(id: string, note: string) {
  const supabase = createClient();
  await supabase.from("meal_checks").update({ note }).eq("id", id);
  void mutate((key) => Array.isArray(key) && key[0] === "meal_checks");
}

// ---------- Moods ----------

export async function addMood(weather: Weather, dayStartHour: number, note?: string) {
  const supabase = createClient();
  const user_id = await requireUserId();
  const row = { id: makeId(), user_id, date: getTodayKey(dayStartHour), weather, note, at: Date.now() };
  const { error } = await supabase.from("moods").insert(row);
  if (error) throw error;
  void mutate((key) => Array.isArray(key) && key[0] === "moods");
  return row;
}

export async function updateMoodNote(id: string, note: string) {
  const supabase = createClient();
  await supabase.from("moods").update({ note }).eq("id", id);
  void mutate((key) => Array.isArray(key) && key[0] === "moods");
}

// ---------- Journal ----------

export async function addJournalEntry(text: string, dayStartHour: number, promptUsed?: string) {
  const supabase = createClient();
  const user_id = await requireUserId();
  const row = {
    id: makeId(),
    user_id,
    date: getTodayKey(dayStartHour),
    text,
    prompt_used: promptUsed,
    at: Date.now(),
  };
  const { error } = await supabase.from("journal").insert(row);
  if (error) throw error;
  void mutate("journal-all");
  return { id: row.id, date: row.date, text: row.text, promptUsed: row.prompt_used, at: row.at };
}

// ---------- Close day ----------

export async function buildDaySummary(
  dateKey: string,
  waterGoalMl: number,
): Promise<DayClosedSummary> {
  const supabase = createClient();
  const user_id = await requireUserId();

  const [water, meals, moods, journalEntries] = await Promise.all([
    supabase.from("water_logs").select("ml").eq("user_id", user_id).eq("date", dateKey),
    supabase.from("meal_checks").select("slot, status").eq("user_id", user_id).eq("date", dateKey),
    supabase.from("moods").select("weather").eq("user_id", user_id).eq("date", dateKey),
    supabase
      .from("journal")
      .select("text, at")
      .eq("user_id", user_id)
      .eq("date", dateKey)
      .order("at", { ascending: false }),
  ]);

  return {
    waterMl: (water.data ?? []).reduce((sum, w) => sum + w.ml, 0),
    waterGoalMl,
    meals: (meals.data ?? []) as { slot: MealSlot; status: MealStatus }[],
    weatherStrip: (moods.data ?? []).map((m) => m.weather as Weather),
    fireflyCount: journalEntries.data?.length ?? 0,
    lastJournalLine: journalEntries.data?.[0]?.text,
  };
}

export async function closeDay(dateKey: string, waterGoalMl: number) {
  const supabase = createClient();
  const user_id = await requireUserId();
  const summary = await buildDaySummary(dateKey, waterGoalMl);
  const row = {
    id: makeId(),
    user_id,
    date: dateKey,
    summary_snapshot: summary,
    at: Date.now(),
  };
  const { error } = await supabase.from("days_closed").upsert(row, { onConflict: "user_id,date" });
  if (error) throw error;
  void mutate((key) => Array.isArray(key) && key[0] === "day-closed");
  void mutate("days-closed-count");
  return { id: row.id, date: row.date, summarySnapshot: summary, at: row.at };
}

// ---------- Panic sessions ----------

export async function logPanicSession(durationSec: number, dayStartHour: number) {
  const supabase = createClient();
  const user_id = await requireUserId();
  const row = { id: makeId(), user_id, date: getTodayKey(dayStartHour), duration_sec: durationSec, at: Date.now() };
  const { error } = await supabase.from("panic_sessions").insert(row);
  if (error) throw error;
  return row;
}

// ---------- Meme links (admin-managed) ----------

export async function addMemeLink(url: string, kind: "instagram" | "youtube") {
  const supabase = createClient();
  const { error } = await supabase.from("meme_links").insert({ url, kind });
  if (error) throw error;
  void mutate("meme-links");
}

export async function removeMemeLink(id: string) {
  const supabase = createClient();
  await supabase.from("meme_links").delete().eq("id", id);
  void mutate("meme-links");
}

// ---------- Export (her own data only — RLS means that's all a query can ever return) ----------

export interface Backup {
  exportedAt: number;
  version: 2;
  tables: {
    waterLogs: WaterLog[];
    mealChecks: MealCheck[];
    moods: Mood[];
    journal: JournalEntry[];
    daysClosed: DayClosed[];
    panicSessions: PanicSession[];
  };
}

export async function exportBackup(): Promise<Backup> {
  const supabase = createClient();
  const user_id = await requireUserId();

  const [waterLogs, mealChecks, moods, journal, daysClosed, panicSessions] = await Promise.all([
    supabase.from("water_logs").select("id, date, ml, at").eq("user_id", user_id),
    supabase.from("meal_checks").select("id, date, slot, status, note, at").eq("user_id", user_id),
    supabase.from("moods").select("id, date, weather, note, at").eq("user_id", user_id),
    supabase.from("journal").select("id, date, text, prompt_used, at").eq("user_id", user_id),
    supabase.from("days_closed").select("id, date, summary_snapshot, at").eq("user_id", user_id),
    supabase.from("panic_sessions").select("id, date, duration_sec, at").eq("user_id", user_id),
  ]);

  return {
    exportedAt: Date.now(),
    version: 2,
    tables: {
      waterLogs: (waterLogs.data ?? []) as WaterLog[],
      mealChecks: (mealChecks.data ?? []) as MealCheck[],
      moods: (moods.data ?? []) as Mood[],
      journal: (journal.data ?? []).map((j) => ({
        id: j.id,
        date: j.date,
        text: j.text,
        promptUsed: j.prompt_used ?? undefined,
        at: j.at,
      })),
      daysClosed: (daysClosed.data ?? []).map((d) => ({
        id: d.id,
        date: d.date,
        summarySnapshot: d.summary_snapshot as DayClosedSummary,
        at: d.at,
      })),
      panicSessions: (panicSessions.data ?? []).map((p) => ({
        id: p.id,
        date: p.date,
        durationSec: p.duration_sec,
        at: p.at,
      })),
    },
  };
}

export async function importBackup(backup: Backup): Promise<void> {
  const supabase = createClient();
  const user_id = await requireUserId();
  const { tables } = backup;

  await Promise.all([
    supabase
      .from("water_logs")
      .upsert(tables.waterLogs.map((w) => ({ ...w, user_id }))),
    supabase
      .from("meal_checks")
      .upsert(tables.mealChecks.map((m) => ({ ...m, user_id }))),
    supabase.from("moods").upsert(tables.moods.map((m) => ({ ...m, user_id }))),
    supabase.from("journal").upsert(
      tables.journal.map((j) => ({
        id: j.id,
        user_id,
        date: j.date,
        text: j.text,
        prompt_used: j.promptUsed,
        at: j.at,
      })),
    ),
    supabase.from("days_closed").upsert(
      tables.daysClosed.map((d) => ({
        id: d.id,
        user_id,
        date: d.date,
        summary_snapshot: d.summarySnapshot,
        at: d.at,
      })),
    ),
    supabase.from("panic_sessions").upsert(
      tables.panicSessions.map((p) => ({
        id: p.id,
        user_id,
        date: p.date,
        duration_sec: p.durationSec,
        at: p.at,
      })),
    ),
  ]);
}
