"use client";

import { useEffect } from "react";
import { useSettings } from "@/lib/hooks";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const settings = useSettings();

  useEffect(() => {
    document.documentElement.dataset.theme = settings.palette;
  }, [settings.palette]);

  return <>{children}</>;
}
