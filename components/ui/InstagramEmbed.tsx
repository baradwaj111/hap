"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadInstagramScript(): Promise<void> {
  if (window.instgrm) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("embed.js failed to load"));
    document.body.appendChild(script);
  });
  return scriptPromise;
}

export function InstagramEmbed({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let pollId: ReturnType<typeof setInterval> | undefined;

    loadInstagramScript().then(() => {
      if (cancelled) return;
      window.instgrm?.Embeds.process();
      pollId = setInterval(() => {
        if (ref.current?.querySelector("iframe")) {
          setReady(true);
          clearInterval(pollId);
        }
      }, 300);
    });

    return () => {
      cancelled = true;
      if (pollId) clearInterval(pollId);
    };
  }, [url]);

  return (
    <div ref={ref} className="mx-auto w-full max-w-md">
      {!ready && <p className="py-6 text-center text-xs text-muted">loading a little something...</p>}
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={url}
        data-instgrm-version="14"
        style={{ margin: "0 auto", width: "100%" }}
      />
    </div>
  );
}
