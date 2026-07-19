"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      // A dev-registered service worker caches Next's dev bundle chunks and
      // fights with Fast Refresh (stale chunks -> forced reloads, frozen UI).
      // Self-heal any browser that already picked one up from an earlier run.
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => reg.unregister());
      });
      if (window.caches) {
        caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
      }
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // offline-first app; a failed registration just means no offline cache yet
    });
  }, []);

  return null;
}
