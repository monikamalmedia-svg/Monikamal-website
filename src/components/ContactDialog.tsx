"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Check, Loader2, X } from "lucide-react";

export const SERVICE_CHOICES = ["ugc", "ai", "product", "unsure"] as const;
export type ServiceChoice = (typeof SERVICE_CHOICES)[number];

/** Package keys from the pricing cards (UGC, AI commercials, product photography). */
const PACKAGE_IDS = ["starter", "growth", "partnership", "ugcOne", "ugcThree", "ugcCustom", "photoFive", "photoTen", "photoCustom"] as const;
type PackageId = (typeof PACKAGE_IDS)[number];

type OpenOptions = { service?: string | null; packageId?: string | null; opener?: HTMLElement | null };

type ContactDialogValue = { openContact: (options?: OpenOptions) => void };

const ContactDialogContext = createContext<ContactDialogValue | null>(null);

const subscribeNever = () => () => {};

export function useContactDialog() {
  const context = useContext(ContactDialogContext);
  if (!context) throw new Error("useContactDialog must be used within ContactDialogProvider");
  return context;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const asService = (value?: string | null): ServiceChoice | null =>
  (SERVICE_CHOICES as readonly string[]).includes(value ?? "") ? (value as ServiceChoice) : null;
const asPackage = (value?: string | null): PackageId | null =>
  (PACKAGE_IDS as readonly string[]).includes(value ?? "") ? (value as PackageId) : null;

type Fields = { name: string; email: string; company: string; message: string };
type Errors = Partial<Record<"service" | "name" | "email" | "message", string>>;
type Status = "idle" | "sending" | "success" | "error";

const EMPTY: Fields = { name: "", email: "", company: "", message: "" };

/**
 * One contact dialog for the whole site. Opens from `openContact()`, from any element with
 * `data-contact-open` (optional `data-contact-service`), and from links to `#kennismaking`
 * (without JS those links still lead to the contact section).
 */
export function ContactDialogProvider({ children, email }: { children: ReactNode; email: string }) {
  const t = useTranslations("ContactDialog");
  const reduceMotion = useReducedMotion();
  const titleId = useId();
  const noteId = useId();
  const [open, setOpen] = useState(false);
  const [service, setService] = useState<ServiceChoice | null>(null);
  const [packageId, setPackageId] = useState<PackageId | null>(null);
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const isClient = useSyncExternalStore(subscribeNever, () => true, () => false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const openContact = useCallback((options: OpenOptions = {}) => {
    openerRef.current = options.opener ?? (document.activeElement as HTMLElement | null);
    // A fresh request after a sent one; otherwise keep what was typed.
    setStatus((current) => {
      if (current === "success") {
        setFields(EMPTY);
        setErrors({});
        return "idle";
      }
      return current;
    });
    const preset = asService(options.service);
    if (preset) setService(preset);
    const pack = asPackage(options.packageId);
    if (pack) {
      setPackageId(pack);
      setService(pack.startsWith("ugc") ? "ugc" : pack.startsWith("photo") ? "product" : "ai");
    }
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  // Every "Plan een kennismaking" / #kennismaking link and [data-contact-open] opens the dialog.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = (event.target as Element | null)?.closest<HTMLElement>('[data-contact-open], a[href$="#kennismaking"]');
      if (!target) return;
      event.preventDefault();
      openContact({ service: target.dataset.contactService, packageId: target.dataset.contactPackage, opener: target });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [openContact]);

  // While open: page inert, no background scroll, Escape closes, Tab stays inside, focus returns after.
  useEffect(() => {
    if (!open) return;
    const others = [...document.body.children].filter((node) => node !== rootRef.current) as HTMLElement[];
    const wasInert = others.map((node) => node.inert);
    others.forEach((node) => (node.inert = true));
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    const focusFirst = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    }, 30);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const items = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((node) => node.offsetParent !== null);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(focusFirst);
      document.removeEventListener("keydown", onKeyDown);
      others.forEach((node, index) => (node.inert = wasInert[index]));
      html.style.overflow = previousOverflow;
      const opener = openerRef.current;
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, [open]);

  // The submit button disappears on success: move focus to "Close" so it stays in the dialog.
  useEffect(() => {
    if (!open || status !== "success") return;
    panelRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
  }, [open, status]);

  const update = (key: keyof Fields, value: string) => {
    setFields((current) => ({ ...current, [key]: value }));
    if (errors[key as keyof Errors]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const honeypot = String(new FormData(event.currentTarget).get("website_url") ?? "").trim();
    const next: Errors = {};
    if (!service) next.service = t("errors.service");
    if (!fields.name.trim()) next.name = t("errors.name");
    if (!EMAIL_RE.test(fields.email.trim())) next.email = t("errors.email");
    if (!fields.message.trim()) next.message = t("errors.message");
    setErrors(next);
    if (Object.keys(next).length > 0) {
      const firstInvalid = (["service", "name", "email", "message"] as const).find((key) => next[key]);
      panelRef.current?.querySelector<HTMLElement>(`[data-field="${firstInvalid}"]`)?.focus();
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fields.name.trim(),
          email: fields.email.trim(),
          brand: fields.company.trim(),
          message: fields.message.trim(),
          contentType: service ? t(`services.${service}`) : "",
          package: packageId ? t(`packageOptions.${packageId}`) : "",
          website_url: honeypot,
        }),
      });
      if (!response.ok) throw new Error(String(response.status));
      setStatus("success");
      setPackageId(null);
    } catch {
      // Keep everything that was typed; the visitor can simply send again.
      setStatus("error");
    }
  };

  const value = useMemo(() => ({ openContact }), [openContact]);
  const sending = status === "sending";
  const fieldClass =
    "contact-field mt-1.5 h-[45px] w-full rounded-xl border px-3.5 text-base text-ivory-strong outline-none transition-colors placeholder:text-foreground-muted/60 focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/25 aria-[invalid=true]:border-[#f0a594]/80";
  const labelClass = "block text-[15px] text-ivory";
  // Readable error colour on the dark panel (not used for regular field borders).
  const errorClass = "mt-1.5 text-sm text-[#f0a594]";

  const dialog = (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={rootRef}
          key="contact-dialog"
          className="contact-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.25 }}
        >
          <div aria-hidden className="contact-backdrop" onClick={close} />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={noteId}
            className="contact-panel"
            initial={reduceMotion ? false : { y: 14 }}
            animate={{ y: 0 }}
            exit={reduceMotion ? undefined : { y: 10 }}
            transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id={titleId} className="contact-title font-display leading-[1.12] font-light text-ivory-strong">
                  {t("title")}
                </h2>
                <p id={noteId} className="mt-1.5 text-[15.5px] leading-snug text-foreground-muted">
                  {t("note")}
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label={t("closeLabel")}
                className="-mt-1 -mr-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 text-ivory transition-colors hover:border-white/40 hover:text-ivory-strong focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:outline-none"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="mt-4">
              {status === "success" ? (
                <div role="status" className="flex flex-col items-start gap-4 py-4">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold/50 text-gold">
                    <Check className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </span>
                  <p className="font-display text-2xl text-ivory-strong">{t("success")}</p>
                  <button
                    type="button"
                    data-autofocus
                    onClick={close}
                    className="inline-flex h-12 items-center rounded-full bg-ivory-strong px-7 text-base text-[#16110f] transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0e0d] focus-visible:outline-none"
                  >
                    {t("close")}
                  </button>
                </div>
              ) : (
                <form noValidate onSubmit={submit} aria-busy={sending}>
                  <fieldset>
                    <legend className={labelClass}>{t("serviceLabel")}</legend>
                    <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-invalid={Boolean(errors.service)}>
                      {SERVICE_CHOICES.map((choice, index) => {
                        const selected = service === choice;
                        return (
                          <button
                            key={choice}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            data-autofocus={index === 0 ? "" : undefined}
                            data-field={index === 0 ? "service" : undefined}
                            onClick={() => {
                              setService(choice);
                              if (errors.service) setErrors((current) => ({ ...current, service: undefined }));
                            }}
                            className={`h-9 rounded-full border px-3.5 text-[14.5px] transition-colors focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:outline-none ${
                              selected ? "border-gold bg-gold/20 text-ivory-strong" : "contact-field text-ivory hover:border-white/35"
                            }`}
                          >
                            {t(`services.${choice}`)}
                          </button>
                        );
                      })}
                    </div>
                    {errors.service ? <p className={errorClass}>{errors.service}</p> : null}
                  </fieldset>

                  {packageId ? (
                    <p className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-ivory">
                      <span>
                        {t("packageChosen")} <span className="text-ivory-strong">{t(`packageOptions.${packageId}`)}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setPackageId(null)}
                        className="text-sm text-gold underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:outline-none"
                      >
                        {t("packageRemove")}
                      </button>
                    </p>
                  ) : null}

                  <div className="mt-[15px] grid gap-[15px] sm:grid-cols-2">
                    <div>
                      <label htmlFor={`${titleId}-name`} className={labelClass}>{t("name")}</label>
                      <input
                        id={`${titleId}-name`}
                        data-field="name"
                        name="name"
                        autoComplete="name"
                        value={fields.name}
                        onChange={(event) => update("name", event.target.value)}
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? `${titleId}-name-error` : undefined}
                        className={fieldClass}
                      />
                      {errors.name ? <p id={`${titleId}-name-error`} className={errorClass}>{errors.name}</p> : null}
                    </div>
                    <div>
                      <label htmlFor={`${titleId}-email`} className={labelClass}>{t("email")}</label>
                      <input
                        id={`${titleId}-email`}
                        data-field="email"
                        name="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        value={fields.email}
                        onChange={(event) => update("email", event.target.value)}
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? `${titleId}-email-error` : undefined}
                        className={fieldClass}
                      />
                      {errors.email ? <p id={`${titleId}-email-error`} className={errorClass}>{errors.email}</p> : null}
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor={`${titleId}-company`} className={labelClass}>
                        {t("company")} <span className="text-foreground-muted">{t("optional")}</span>
                      </label>
                      <input
                        id={`${titleId}-company`}
                        name="company"
                        autoComplete="organization"
                        value={fields.company}
                        onChange={(event) => update("company", event.target.value)}
                        className={fieldClass}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor={`${titleId}-message`} className={labelClass}>{t("message")}</label>
                      <textarea
                        id={`${titleId}-message`}
                        data-field="message"
                        name="message"
                        rows={3}
                        value={fields.message}
                        onChange={(event) => update("message", event.target.value)}
                        aria-invalid={Boolean(errors.message)}
                        aria-describedby={errors.message ? `${titleId}-message-error` : undefined}
                        className={`${fieldClass} !h-[86px] resize-y py-2.5`}
                      />
                      {errors.message ? <p id={`${titleId}-message-error`} className={errorClass}>{errors.message}</p> : null}
                    </div>
                  </div>

                  {/* Spam trap: invisible to people, filled in by bots (rejected by /api/contact). */}
                  <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
                    <label>
                      Website
                      <input type="text" name="website_url" tabIndex={-1} autoComplete="off" />
                    </label>
                  </div>

                  {status === "error" ? (
                    <p role="alert" className="mt-4 text-base text-[#f0a594]">
                      {t("error", { email })}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={sending}
                    className="mt-[18px] inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-full bg-ivory-strong px-7 text-base text-[#16110f] transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0e0d] focus-visible:outline-none disabled:opacity-70 sm:w-auto"
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden /> : null}
                    {sending ? t("sending") : t("submit")}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return (
    <ContactDialogContext.Provider value={value}>
      {children}
      {isClient ? createPortal(dialog, document.body) : null}
    </ContactDialogContext.Provider>
  );
}
