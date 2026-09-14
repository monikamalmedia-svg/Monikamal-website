"use client";

import { useEffect, useRef, useState } from "react";

const PAGE_GRID =
  "repeating-linear-gradient(to right, rgba(212, 175, 55, 0.04) 0, rgba(212, 175, 55, 0.04) 1px, transparent 1px, transparent 48px), repeating-linear-gradient(to bottom, rgba(212, 175, 55, 0.04) 0, rgba(212, 175, 55, 0.04) 1px, transparent 1px, transparent 48px)";

const PAGE_GRID_LIT =
  "repeating-linear-gradient(to right, rgba(212, 175, 55, 0.28) 0, rgba(212, 175, 55, 0.28) 1px, transparent 1px, transparent 48px), repeating-linear-gradient(to bottom, rgba(212, 175, 55, 0.28) 0, rgba(212, 175, 55, 0.28) 1px, transparent 1px, transparent 48px)";

export function CursorSpotlightGrid() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(pointer: fine) and (hover: hover)");
    const sync = () => setEnabled(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const root = rootRef.current;
    if (!root) return;

    let targetX = -400;
    let targetY = -400;
    let x = -400;
    let y = -400;
    let lastWrite = 0;
    let raf = 0;

    const onMouseMove = (event: MouseEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - lastWrite < 16) return;
      lastWrite = now;
      x += (targetX - x) * 0.16;
      y += (targetY - y) * 0.16;
      root.style.setProperty("--mouse-x", `${x}px`);
      root.style.setProperty("--mouse-y", `${y}px`);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1]"
      style={{
        ["--mouse-x" as string]: "-400px",
        ["--mouse-y" as string]: "-400px",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: PAGE_GRID,
          willChange: "transform",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: PAGE_GRID_LIT,
          maskImage:
            "radial-gradient(circle 300px at var(--mouse-x) var(--mouse-y), black 0%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(circle 300px at var(--mouse-x) var(--mouse-y), black 0%, transparent 70%)",
          willChange: "transform",
        }}
      />
    </div>
  );
}
