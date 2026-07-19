"use client";

import { signOut } from "@/lib/hooks";

export function MobileLogoutButton() {
  return (
    <button
      onClick={() => signOut()}
      aria-label="Log out"
      className="focus-ring btn-squish fixed right-4 top-4 z-40 flex h-9 w-9 items-center justify-center rounded-full text-base md:hidden"
      style={{ background: "var(--color-surface)", boxShadow: "0 4px 12px -4px rgb(74 68 88 / 0.2)" }}
    >
      👋
    </button>
  );
}
