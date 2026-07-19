"use client";

import { useEffect, useRef, useState } from "react";

/** Renders `children` only once the placeholder scrolls near the viewport, so
 * heavy embeds (Instagram scripts, YouTube iframes) don't all load at once. */
export function LazyMount({
  children,
  rootMargin = "400px",
  minHeight = 360,
}: {
  children: React.ReactNode;
  rootMargin?: string;
  minHeight?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible, rootMargin]);

  return (
    <div ref={ref} style={visible ? undefined : { minHeight }}>
      {visible ? (
        children
      ) : (
        <div
          className="flex items-center justify-center text-2xl text-muted"
          style={{ minHeight }}
          aria-hidden
        >
          🎁
        </div>
      )}
    </div>
  );
}
