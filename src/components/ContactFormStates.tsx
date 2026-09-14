"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";

const SUBMIT_CLASS =
  "inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-xs font-medium tracking-widest text-white uppercase backdrop-blur-md transition-all duration-300 hover:border-amber-400/60 hover:bg-amber-400/10 hover:text-amber-300 hover:shadow-[0_0_20px_rgba(251,191,36,0.15)] disabled:cursor-wait disabled:opacity-70";

export function FormSubmitButton({
  isSubmitting,
  idleLabel,
  sendingLabel,
  className = "",
}: {
  isSubmitting: boolean;
  idleLabel: string;
  sendingLabel: string;
  className?: string;
}) {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      aria-busy={isSubmitting}
      className={`${SUBMIT_CLASS} ${className}`.trim()}
    >
      {isSubmitting ? (
        <span
          aria-hidden
          className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border border-white/20 border-t-2 border-t-amber-400"
        />
      ) : null}
      {isSubmitting ? sendingLabel : idleLabel}
    </button>
  );
}

export function FormSuccessPanel({ message }: { message: string }) {
  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-amber-400/30 bg-white/[0.03] p-6 text-center text-neutral-200 shadow-[0_0_20px_rgba(251,191,36,0.1)] backdrop-blur-md"
    >
      <span className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10">
        <Check className="h-5 w-5 text-amber-400" strokeWidth={1.75} aria-hidden />
      </span>
      <p className="text-sm leading-relaxed md:text-base">{message}</p>
    </motion.div>
  );
}
