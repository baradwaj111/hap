/**
 * Personalization checklist (spec §0). Edit these before deploying.
 * Everything here is a default — actual values a user changes live in
 * Dexie `settings`, not here. This file only supplies first-run defaults.
 */

export const HER_NAME_DEFAULT = "Dinusha";
export const APP_NAME = "Hap";
export const MASCOT_LABEL = "baby duck";

export const DEFAULT_DAY_START_HOUR = 6; // 06:00 — her day runs 06:00 -> 06:00

export const DEFAULT_REMINDER_TIMES = {
  hydration1: "15:00",
  hydration2: "18:30",
  hydration3: "22:00",
  eat1: "16:00",
  eat2: "21:00",
};

export const DEFAULT_WATER_GOAL_ML = 2000;

export type PaletteId = "lavender" | "peach" | "mint" | "cloud" | "moonlight";

export const PALETTES: { id: PaletteId; label: string }[] = [
  { id: "lavender", label: "Lavender Milk" },
  { id: "peach", label: "Peach Cream" },
  { id: "mint", label: "Mint Whisper" },
  { id: "cloud", label: "Cloud Blue" },
  { id: "moonlight", label: "Moonlight" },
];

export const DEFAULT_PALETTE: PaletteId = "lavender";

// India defaults — confirm or edit before deploying (spec §0, §6.6)
export const DEFAULT_HELPLINES = [
  {
    label: "Tele-MANAS (Govt of India, 24/7)",
    phone: "14416",
  },
  {
    label: "Vandrevala Foundation (24/7)",
    phone: "+919999666555",
  },
  {
    label: "iCall",
    phone: "+919152987821",
  },
  {
    label: "Call your person",
    phone: "REPLACE_ME_WITH_YOUR_NUMBER",
  },
];
