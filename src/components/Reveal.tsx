"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Soft entrance for a content block (opacity + 12px rise) once it scrolls into view.
 * Reduced motion: visible immediately (globals.css .case-reveal).
 */
export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} data-shown={shown || undefined} className={`case-reveal ${className}`}>
      {children}
    </div>
  );
}
