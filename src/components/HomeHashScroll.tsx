"use client";

import { useEffect } from "react";

export function HomeHashScroll() {
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;

    const scroll = () => {
      document.getElementById(hash)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    };

    const frame = window.requestAnimationFrame(scroll);
    const timeout = window.setTimeout(scroll, 80);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, []);

  return null;
}
