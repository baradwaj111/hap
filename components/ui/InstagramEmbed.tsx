"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadInstagramScript(): Promise<void> {
  if (window.instgrm) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
  return scriptPromise;
}

export function InstagramEmbed({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadInstagramScript().then(() => {
      window.instgrm?.Embeds.process();
    });
  }, [url]);

  return (
    <div ref={ref} className="mx-auto w-full max-w-md">
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={url}
        data-instgrm-version="14"
        style={{ margin: "0 auto", width: "100%" }}
      />
    </div>
  );
}
