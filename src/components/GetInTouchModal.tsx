"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { FormSubmitButton, FormSuccessPanel } from "@/components/ContactFormStates";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

type FormStatus = "idle" | "sending" | "success" | "error";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function GetInTouchModal({ open, onClose }: Props) {
  const t = useTranslations("GetInTouch");
  const titleId = useId();
  const subtitleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [feedback, setFeedback] = useState("");
  const isSubmitting = status === "sending";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const frame = window.requestAnimationFrame(() => {
      const first = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      first?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const nodes = [
        ...dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ].filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);

      if (nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      restoreFocusRef.current?.focus();
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setStatus("idle");
      setFeedback("");
    }
  }, [open]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const websiteUrl = String(data.get("website_url") ?? "").trim();

    if (websiteUrl) {
      form.reset();
      setFeedback("");
      setStatus("success");
      return;
    }

    if (!name || !email || !message) {
      setStatus("error");
      setFeedback(t("required"));
      return;
    }

    if (!EMAIL_RE.test(email)) {
      setStatus("error");
      setFeedback(t("invalidEmail"));
      return;
    }

    setStatus("sending");
    setFeedback("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          package: t("packageLabel"),
          message,
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      form.reset();
      setFeedback("");
      setStatus("success");
    } catch {
      setStatus("error");
      setFeedback(t("error"));
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="get-in-touch"
          className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            type="button"
            aria-label={t("close")}
            onClick={onClose}
            className="absolute inset-0 bg-graphite/80 backdrop-blur-sm"
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={subtitleId}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-glass-border bg-background shadow-burgundy-glow"
          >
            <div className="flex items-start justify-between gap-4 border-b border-glass-border/70 px-6 py-5 md:px-7">
              <div>
                <h2
                  id={titleId}
                  className="font-display text-2xl leading-tight font-medium tracking-tight text-foreground md:text-[1.75rem]"
                >
                  {t("title")}
                </h2>
                <p
                  id={subtitleId}
                  className="mt-2 text-sm leading-relaxed text-foreground-muted"
                >
                  {t("subtitle")}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={t("close")}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-glass-border text-foreground-muted transition-colors hover:border-gold hover:text-gold"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="px-6 py-6 md:px-7">
              <AnimatePresence mode="wait" initial={false}>
                {status === "success" ? (
                  <FormSuccessPanel key="success" message={t("success")} />
                ) : (
                  <motion.form
                    key="fields"
                    onSubmit={onSubmit}
                    noValidate
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <label className="flex flex-col gap-2 text-xs tracking-[0.14em] text-foreground-muted uppercase">
                      {t("name")}
                      <input
                        name="name"
                        required
                        autoComplete="name"
                        disabled={isSubmitting}
                        className="rounded-xl border border-glass-border bg-graphite/80 px-4 py-3 text-sm tracking-normal text-foreground normal-case outline-none transition-colors focus:border-blush/40 disabled:opacity-60"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-xs tracking-[0.14em] text-foreground-muted uppercase">
                      {t("email")}
                      <input
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        disabled={isSubmitting}
                        className="rounded-xl border border-glass-border bg-graphite/80 px-4 py-3 text-sm tracking-normal text-foreground normal-case outline-none transition-colors focus:border-blush/40 disabled:opacity-60"
                      />
                    </label>
                    <input
                      type="text"
                      name="website_url"
                      className="hidden"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                    />

                    <label className="flex flex-col gap-2 text-xs tracking-[0.14em] text-foreground-muted uppercase">
                      {t("message")}
                      <textarea
                        name="message"
                        required
                        rows={4}
                        disabled={isSubmitting}
                        className="resize-y rounded-xl border border-glass-border bg-graphite/80 px-4 py-3 text-sm tracking-normal text-foreground normal-case outline-none transition-colors focus:border-blush/40 disabled:opacity-60"
                      />
                    </label>

                    <FormSubmitButton
                      isSubmitting={isSubmitting}
                      idleLabel={t("cta")}
                      sendingLabel={t("sending")}
                    />

                    {feedback && status === "error" ? (
                      <p role="status" className="text-sm text-blush">
                        {feedback}
                      </p>
                    ) : null}
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
