"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

export function PanicButton() {
  const pathname = usePathname();
  const [showLabel, setShowLabel] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (pathname?.startsWith("/hold-my-hand")) return null;

  function startPress() {
    timerRef.current = setTimeout(() => setShowLabel(true), 500);
  }
  function endPress() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShowLabel(false);
  }

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2 sm:bottom-6">
      {showLabel && (
        <span className="card px-3 py-1.5 text-sm text-ink shadow-lg">
          Hold my hand
        </span>
      )}
      <Link
        href="/hold-my-hand"
        aria-label="Hold my hand — comfort and grounding support"
        onPointerDown={startPress}
        onPointerUp={endPress}
        onPointerLeave={endPress}
        className="btn-squish focus-ring flex h-14 w-14 items-center justify-center rounded-full text-2xl shadow-lg"
        style={{ background: "var(--color-accent-2)" }}
      >
        <span aria-hidden>💗</span>
      </Link>
    </div>
  );
}
