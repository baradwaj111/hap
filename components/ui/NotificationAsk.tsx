"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getSetting, setSetting } from "@/lib/db";
import { useSettings } from "@/lib/hooks";
import { isIOS, isStandalone } from "@/lib/platform";

export function NotificationAsk() {
  const settings = useSettings();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("hap-usage-counted")) return;
    sessionStorage.setItem("hap-usage-counted", "1");
    // read the current persisted value directly rather than the (possibly
    // still-default) reactive settings, so opens are never undercounted
    void (async () => {
      const current = await getSetting("usageCount");
      await setSetting("usageCount", current + 1);
    })();
  }, []);

  const skipEntirely = isIOS() && !isStandalone();
  const eligible = settings.notifPermission === "unset" && settings.usageCount >= 3;

  if (dismissed || skipEntirely || !eligible) return null;

  async function handleYes() {
    if (typeof Notification === "undefined") {
      await setSetting("notifPermission", "denied");
      setDismissed(true);
      return;
    }
    const result = await Notification.requestPermission();
    await setSetting("notifPermission", result);
    await setSetting("remindersEnabled", result === "granted");
    setDismissed(true);
  }

  async function handleNo() {
    await setSetting("notifPermission", "denied");
    await setSetting("remindersEnabled", false);
    setDismissed(true);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="card mx-4 mt-4 flex items-center justify-between gap-3 p-4"
        style={{ background: "var(--color-accent-3)" }}
      >
        <p className="text-sm">Want me to send you tiny reminders? You can say no 💛</p>
        <div className="flex shrink-0 gap-2">
          <button onClick={handleYes} className="btn-squish focus-ring flex min-h-11 items-center rounded-full px-3 py-1.5 text-sm" style={{ background: "var(--color-surface)" }}>
            Yes
          </button>
          <button onClick={handleNo} className="focus-ring flex min-h-11 items-center text-sm text-muted">
            No
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
