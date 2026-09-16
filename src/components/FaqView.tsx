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
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section
      id="faq"
      className="relative z-20 scroll-mt-24 bg-transparent px-6 py-12 md:px-10 md:py-16 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <header className="relative z-20 mb-10 max-w-2xl rounded-xl backdrop-blur-sm md:mb-12">
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
            className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-gold/80 via-gold/45 to-gold/40"
          />

          <div className="relative z-20 flex flex-col gap-2.5">
            {items.map((item) => {
              const open = openId === item.id;
              const panelId = `faq-panel-${item.id}`;
              const buttonId = `faq-button-${item.id}`;

              return (
                <div
                  key={item.id}
                  className={`overflow-hidden rounded-2xl border backdrop-blur-lg transition-[border-color,background-color,box-shadow] duration-300 ${
                    open
                      ? "border-gold/30 bg-[#1a0f16]/40 shadow-[0_8px_32px_rgba(212,175,55,0.12)]"
                      : "border-gold/10 bg-[#1a0f16]/40 hover:border-gold/30 hover:bg-gold/5 hover:shadow-[0_8px_32px_rgba(212,175,55,0.1)]"
                  }`}
                >
                  <h3 className="m-0">
                    <button
                      type="button"
                      id={buttonId}
                      aria-expanded={open}
                      aria-controls={panelId}
                      onClick={() => setOpenId(open ? null : item.id)}
                      className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-start gap-4 px-5 py-5 text-left md:px-7 md:py-6"
                    >
                      <span className="font-display text-lg leading-snug font-medium tracking-tight text-pretty text-foreground md:text-xl">
                        {item.question}
                      </span>
                      <ChevronDown
                        className={`mt-0.5 h-5 w-5 shrink-0 text-amber-400 transition-transform duration-300 ${
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
                          duration: 0.28,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-3xl px-5 pt-0 pb-5 text-sm leading-relaxed text-neutral-300 md:px-7 md:pb-6 md:text-base">
                          <HighlightedText text={item.answer} />
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
