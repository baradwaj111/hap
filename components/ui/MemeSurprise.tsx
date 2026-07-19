"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import memes from "@/data/memes.json";
import { setSetting } from "@/lib/db";
import { useSettings } from "@/lib/hooks";

const DAY_MS = 24 * 60 * 60 * 1000;

export function MemeSurprise() {
  const settings = useSettings();
  const [revealedSrc, setRevealedSrc] = useState<string | null>(null);

  const memeList = memes as string[];
  // checking the clock against a persisted timestamp is expected here, not a
  // render-purity concern in practice — it only ever gates a one-time reveal
  // eslint-disable-next-line react-hooks/purity
  const due = memeList.length > 0 && Date.now() >= settings.nextMemeEligibleAt;

  if (!due) return null;

  async function handleOpen() {
    const unseen = memeList.filter((m) => !settings.shownMemeIds.includes(m));
    const pool = unseen.length > 0 ? unseen : memeList;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const nextShown =
      unseen.length > 0 ? [...settings.shownMemeIds, pick] : [pick];

    setRevealedSrc(pick);
    await setSetting("shownMemeIds", nextShown);
    await setSetting(
      "nextMemeEligibleAt",
      Date.now() + (2 + Math.random()) * DAY_MS,
    );
  }

  return (
    <div className="card-tint-3 p-5 text-center">
      {!revealedSrc ? (
        <button onClick={handleOpen} className="btn-squish focus-ring w-full">
          <span className="text-4xl" aria-hidden>
            🎁
          </span>
          <p className="font-display mt-2 text-lg">a little something for you 🐣</p>
        </button>
      ) : (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="relative mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-2xl">
              <Image src={revealedSrc} alt="A little surprise for you" fill className="object-cover" />
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
