"use client";

import { useEffect, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import {
  DEFAULT_SETTINGS,
  getAllSettings,
  type JournalEntry,
  type MealCheck,
  type Mood,
  type Settings,
  type Weather,
  type WaterLog,
} from "./db";
import { getTodayKey } from "./date";
import { createClient } from "./supabase/client";

export function useSettings(): Settings {
  const { data } = useSWR("settings", getAllSettings, {
    fallbackData: DEFAULT_SETTINGS,
    revalidateOnFocus: true,
  });
  return data ?? DEFAULT_SETTINGS;
}

/** Call after any settings write so every screen picks up the change. */
export function useRevalidateSettings() {
  const { mutate } = useSWRConfig();
  return () => mutate("settings");
}

/** Live-updating "today" key on her adjusted clock — re-evaluates every minute. */
export function useTodayKey(dayStartHour: number): string {
  const [key, setKey] = useState(() => getTodayKey(dayStartHour));
  useEffect(() => {
    const id = setInterval(() => setKey(getTodayKey(dayStartHour)), 60_000);
    return () => clearInterval(id);
  }, [dayStartHour]);
  return key;
}

export function useUser() {
  const { data, isLoading } = useSWR("auth-user", async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, display_name")
      .eq("id", user.id)
      .single();
    return { id: user.id, role: profile?.role as "admin" | "user" | undefined, displayName: profile?.display_name };
  });
  return { user: data ?? null, loading: isLoading };
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  window.location.href = "/login";
}

export function useTodayWater(dayStartHour: number) {
  const todayKey = useTodayKey(dayStartHour);
  const { data } = useSWR(["water_logs", todayKey], async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [] as WaterLog[];
    const { data } = await supabase
      .from("water_logs")
      .select("id, date, ml, at")
      .eq("user_id", user.id)
      .eq("date", todayKey);
    return (data ?? []) as WaterLog[];
  });
  const logs = data ?? [];
  const totalMl = logs.reduce((sum, l) => sum + l.ml, 0);
  return { logs, totalMl };
}

export function useTodayMeals(dayStartHour: number): MealCheck[] {
  const todayKey = useTodayKey(dayStartHour);
  const { data } = useSWR(["meal_checks", todayKey], async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [] as MealCheck[];
    const { data } = await supabase
      .from("meal_checks")
      .select("id, date, slot, status, note, at")
      .eq("user_id", user.id)
      .eq("date", todayKey);
    return (data ?? []) as MealCheck[];
  });
  return data ?? [];
}

export function useTodayMoods(dayStartHour: number): Mood[] {
  const todayKey = useTodayKey(dayStartHour);
  const { data } = useSWR(["moods", todayKey], async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [] as Mood[];
    const { data } = await supabase
      .from("moods")
      .select("id, date, weather, note, at")
      .eq("user_id", user.id)
      .eq("date", todayKey);
    return (data ?? []) as Mood[];
  });
  return data ?? [];
}

async function fetchAllJournal(): Promise<JournalEntry[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("journal")
    .select("id, date, text, prompt_used, at")
    .eq("user_id", user.id)
    .order("at", { ascending: false });
  return (data ?? []).map((j) => ({
    id: j.id,
    date: j.date,
    text: j.text,
    promptUsed: j.prompt_used ?? undefined,
    at: j.at,
  }));
}

export function useAllJournal(): JournalEntry[] {
  const { data } = useSWR("journal-all", fetchAllJournal);
  return data ?? [];
}

export function useFireflyCount(): number {
  return useAllJournal().length;
}

export function useStarCount(): number {
  const { data } = useSWR("days-closed-count", async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return 0;
    const { count } = await supabase
      .from("days_closed")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    return count ?? 0;
  });
  return data ?? 0;
}

export function useIsDayClosed(dateKey: string): boolean {
  const { data } = useSWR(["day-closed", dateKey], async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase
      .from("days_closed")
      .select("id")
      .eq("user_id", user.id)
      .eq("date", dateKey)
      .maybeSingle();
    return !!data;
  });
  return data ?? false;
}

export function useLastWeather(dayStartHour: number): Weather | undefined {
  const moods = useTodayMoods(dayStartHour);
  return [...moods].sort((a, b) => b.at - a.at)[0]?.weather;
}

export interface MemeLinkRow {
  id: string;
  url: string;
  kind: "instagram" | "youtube";
  addedAt: string;
}

export function useMemeLinks(): MemeLinkRow[] {
  const { data } = useSWR("meme-links", async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("meme_links")
      .select("id, url, kind, added_at")
      .order("added_at", { ascending: true });
    return (data ?? []).map((m) => ({ id: m.id, url: m.url, kind: m.kind, addedAt: m.added_at }));
  });
  return data ?? [];
}

export function useRevalidate() {
  const { mutate } = useSWRConfig();
  return mutate;
}
