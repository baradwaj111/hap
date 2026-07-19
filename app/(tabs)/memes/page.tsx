"use client";

import { useMemo } from "react";
import { InstagramEmbed } from "@/components/ui/InstagramEmbed";
import { LazyMount } from "@/components/ui/LazyMount";
import { getYoutubeEmbedUrl } from "@/lib/memeEmbed";
import { useMemeLinks } from "@/lib/hooks";

export default function MemesPage() {
  const links = useMemeLinks();
  // newest first
  const ordered = useMemo(() => [...links].reverse(), [links]);

  return (
    <main className="flex flex-col gap-5 px-4 pb-6 pt-6 md:pt-4">
      <div>
        <p className="eyebrow">A little something for you</p>
        <h1 className="font-display mt-1 text-2xl md:text-3xl">Memes of the day</h1>
      </div>

      {ordered.length === 0 ? (
        <div className="card-tint-3 p-8 text-center">
          <span className="text-4xl" aria-hidden>
            🎁
          </span>
          <p className="mt-3 text-sm text-muted">
            nothing added yet — check back once a little something gets dropped in here
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {ordered.map((meme) => (
            <div key={meme.id} className="card overflow-hidden p-4">
              <LazyMount>
                {meme.kind === "instagram" ? (
                  <InstagramEmbed url={meme.url} />
                ) : (
                  <div className="aspect-[9/16] w-full max-w-md mx-auto overflow-hidden rounded-2xl">
                    <iframe
                      src={getYoutubeEmbedUrl(meme.url) ?? undefined}
                      title="A little video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                      className="h-full w-full"
                    />
                  </div>
                )}
              </LazyMount>
            </div>
          ))}
        </div>
      )}

      {ordered.length > 0 && (
        <p className="text-center text-xs text-muted">
          {ordered.length} little {ordered.length === 1 ? "thing" : "things"} for you 💛
        </p>
      )}
    </main>
  );
}
