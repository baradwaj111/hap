"use client";

import { useEffect } from "react";
import { useIsNightMode, useSettings } from "@/lib/hooks";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const settings = useSettings();
  const isNight = useIsNightMode(settings.dayStartHour);

  useEffect(() => {
    document.documentElement.dataset.theme = isNight ? "night" : settings.palette;
  }, [isNight, settings.palette]);

  return <>{children}</>;
}
