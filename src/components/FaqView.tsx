"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { DisplayFaqItem } from "@/lib/cms-faq";

const highlight = (chunks: ReactNode) => (
  <span className="font-medium text-amber-300">{chunks}</span>
);

function HighlightedText({ text }: { text: string }) {
  const parts = text.split(/(<hl>[\s\S]*?<\/hl>)/g);
  return (
    <>
      {parts.map((part, index) => {
        const match = part.match(/^<hl>([\s\S]*?)<\/hl>$/);
        if (match) {
          return <span key={index}>{highlight(match[1])}</span>;
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

type Props = {
  kicker: string;
  heading: string;
  subheading: string;
  items: DisplayFaqItem[];
};

export function FaqView({ kicker, heading, subheading, items }: Props) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <section
      id="faq"
      className="relative z-20 scroll-mt-28 bg-transparent px-6 pt-28 pb-24 md:px-10 md:pt-36 md:pb-32 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <header className="relative z-20 mb-12 max-w-2xl rounded-xl backdrop-blur-sm md:mb-16">
          <p className="mb-4 text-xs tracking-[0.28em] text-gold uppercase md:text-sm">
            {kicker}
          </p>
          <h2 className="font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.05] font-medium tracking-tight text-foreground">
            {heading}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground-muted md:text-lg">
            {subheading}
          </p>
        </header>

        <div className="relative pl-6 md:pl-8">
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 bottom-0 left-0 w-[1px] bg-gradient-to-b from-amber-400/80 via-amber-400/20 to-transparent"
          />

          <div className="relative z-20 flex flex-col gap-3">
            {items.map((item, index) => {
              const open = openId === item.id;
              const panelId = `faq-panel-${item.id}`;
              const buttonId = `faq-button-${item.id}`;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.45,
                    delay: index * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={`rounded-2xl border backdrop-blur-md transition-all duration-300 ${
                    open
                      ? "border-amber-400/50 bg-white/[0.04] shadow-[0_0_20px_rgba(251,191,36,0.15)]"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <h3>
                    <button
                      type="button"
                      id={buttonId}
                      aria-expanded={open}
                      aria-controls={panelId}
                      onClick={() => setOpenId(open ? null : item.id)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left md:px-7 md:py-6"
                    >
                      <span className="font-display text-lg font-medium tracking-tight text-foreground md:text-xl">
                        {item.question}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-amber-400 transition-transform duration-300 ${
                          open ? "rotate-180" : ""
                        }`}
                        strokeWidth={1.5}
                        aria-hidden
                      />
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {open ? (
                      <motion.div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: 0.3,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-3xl px-5 pt-3 pb-1 text-sm leading-relaxed text-neutral-300 md:px-7 md:pb-6 md:text-base">
                          <HighlightedText text={item.answer} />
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
