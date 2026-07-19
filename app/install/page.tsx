"use client";

import { useEffect, useState } from "react";
import { Duck } from "@/components/mascot/Duck";
import { APP_NAME } from "@/lib/config";
import { isAndroid, isIOS, isStandalone } from "@/lib/platform";

export default function InstallPage() {
  const [platform, setPlatform] = useState<"ios" | "android" | "other" | null>(null);
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    // reading browser/display-mode APIs that aren't available during SSR
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStandalone(isStandalone());
    if (isIOS()) setPlatform("ios");
    else if (isAndroid()) setPlatform("android");
    else setPlatform("other");
  }, []);

  if (standalone) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <Duck state="happy" />
        <p className="font-display text-xl">I&apos;m already living on your home screen 🐣</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center gap-6 px-6 pb-10 pt-10 text-center md:max-w-xl md:pt-16">
      <Duck state="idle" />
      <h1 className="font-display text-2xl">Add me to your home screen so I can stay with you</h1>

      {platform === "ios" && (
        <ol className="card flex w-full flex-col gap-4 p-5 text-left text-sm">
          <li className="flex items-center gap-3">
            <span className="text-xl" aria-hidden>
              🐣
            </span>
            Tap the <strong>Share</strong> button in Safari&apos;s toolbar (the square with an
            arrow).
          </li>
          <li className="flex items-center gap-3">
            <span className="text-xl" aria-hidden>
              🐥
            </span>
            Scroll down and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong>.
          </li>
          <li className="flex items-center gap-3">
            <span className="text-xl" aria-hidden>
              🌷
            </span>
            Tap <strong>Add</strong> in the top right. That&apos;s it.
          </li>
        </ol>
      )}

      {platform === "android" && (
        <ol className="card flex w-full flex-col gap-4 p-5 text-left text-sm">
          <li className="flex items-center gap-3">
            <span className="text-xl" aria-hidden>
              🐣
            </span>
            Tap the <strong>⋮ menu</strong> in Chrome&apos;s top right corner.
          </li>
          <li className="flex items-center gap-3">
            <span className="text-xl" aria-hidden>
              🐥
            </span>
            Tap <strong>&ldquo;Add to Home screen&rdquo;</strong> or{" "}
            <strong>&ldquo;Install app&rdquo;</strong>.
          </li>
          <li className="flex items-center gap-3">
            <span className="text-xl" aria-hidden>
              🌷
            </span>
            Tap <strong>Add</strong> or <strong>Install</strong> to confirm.
          </li>
        </ol>
      )}

      {platform === "other" && (
        <p className="card p-5 text-sm">
          Open this page on your phone&apos;s browser to add {APP_NAME} to your home screen —
          everything still works right here in the meantime.
        </p>
      )}

      <p className="text-xs text-muted">
        No pressure — {APP_NAME} works fine in the browser too. This just makes it feel a little
        more like home.
      </p>
    </main>
  );
}
