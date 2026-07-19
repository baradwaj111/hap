"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAME } from "@/lib/config";
import { signOut, useUser } from "@/lib/hooks";

const HER_TABS = [
  { href: "/today", label: "Today", icon: "🐣" },
  { href: "/journal", label: "Journal", icon: "✨" },
  { href: "/hope", label: "Hope", icon: "🌈" },
  { href: "/memes", label: "Memes", icon: "🎁" },
] as const;

const ADMIN_TABS = [
  { href: "/settings", label: "Settings", icon: "⚙️" },
  { href: "/memes", label: "Memes", icon: "🎁" },
] as const;

export function TabBar() {
  const pathname = usePathname();
  const { user } = useUser();
  const tabs = user?.role === "admin" ? ADMIN_TABS : HER_TABS;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t md:inset-y-4 md:left-4 md:right-auto md:bottom-auto md:flex md:w-64 md:flex-col md:rounded-[28px] md:border-t-0"
      style={{
        background:
          "linear-gradient(180deg, var(--color-surface) 0%, color-mix(in srgb, var(--color-accent-1) 10%, var(--color-surface)) 100%)",
        borderColor: "color-mix(in srgb, var(--color-ink) 8%, transparent)",
        boxShadow: "0 12px 32px color-mix(in srgb, var(--color-ink) 10%, transparent)",
      }}
      aria-label="Main navigation"
    >
      <div className="hidden px-6 pb-4 pt-7 md:block">
        <p className="font-display text-xl">{APP_NAME} 🐥</p>
        <p className="text-xs text-muted">a gentle companion</p>
      </div>

      <ul className="mx-auto flex max-w-md items-stretch justify-around pb-[env(safe-area-inset-bottom)] md:mx-0 md:mt-2 md:max-w-none md:flex-1 md:flex-col md:items-stretch md:justify-start md:gap-1.5 md:px-3 md:pb-0">
        {tabs.map((tab) => {
          const active = pathname?.startsWith(tab.href);
          return (
            <li key={tab.href} className="flex-1 md:flex-none">
              <Link
                href={tab.href}
                className="focus-ring btn-squish flex flex-col items-center gap-1 py-2.5 text-xs md:flex-row md:justify-start md:gap-3 md:rounded-2xl md:px-3.5 md:py-3 md:text-sm md:transition-colors md:hover:bg-[color-mix(in_srgb,var(--color-accent-1)_16%,transparent)]"
                style={{
                  color: active ? "var(--color-ink)" : "var(--color-muted)",
                  fontWeight: active ? 700 : 550,
                  background: active ? "color-mix(in srgb, var(--color-accent-1) 30%, transparent)" : "transparent",
                }}
                aria-current={active ? "page" : undefined}
              >
                <span
                  className="relative flex h-9 w-9 items-center justify-center rounded-2xl text-lg md:h-8 md:w-8 md:rounded-xl"
                  aria-hidden
                >
                  {active && (
                    <motion.span
                      layoutId="tab-active-pill"
                      className="absolute inset-0 rounded-2xl md:rounded-xl"
                      style={{ background: "var(--color-accent-1)" }}
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{tab.icon}</span>
                </span>
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <button
        onClick={() => signOut()}
        className="focus-ring btn-squish hidden items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm text-muted md:mx-3 md:mb-4 md:mt-2 md:flex md:border-t md:pt-4 md:transition-colors md:hover:bg-[color-mix(in_srgb,var(--color-accent-1)_12%,transparent)]"
        style={{ borderColor: "color-mix(in srgb, var(--color-ink) 8%, transparent)" }}
      >
        <span className="flex h-8 w-8 items-center justify-center text-lg" aria-hidden>
          👋
        </span>
        Log out
      </button>
    </nav>
  );
}
