"use client";

import {
  FormEvent,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";
import { FormSubmitButton } from "@/components/ContactFormStates";
import { Link } from "@/i18n/navigation";
import { useSelectedPackage } from "@/context/SelectedPackageContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CONTENT_TYPES = ["ugc", "ai", "product", "hybrid", "unsure"] as const;
const PLATFORMS = ["instagram", "metaAds", "tiktok", "webshop", "organic", "other"] as const;

const PACKAGE_OPTION_IDS = [
  "starter",
  "growth",
  "partnership",
  "photographyFive",
  "photographyTen",
] as const;

export type ContentTypeId = (typeof CONTENT_TYPES)[number];
type PlatformId = (typeof PLATFORMS)[number];
type PackageOptionId = (typeof PACKAGE_OPTION_IDS)[number];
type Step = 1 | 2 | 3;
type FormStatus = "idle" | "sending" | "success" | "error";
type FieldErrors = Partial<Record<"contentType" | "product" | "name" | "email", string>>;

type Fields = {
  contentType: ContentTypeId | null;
  platforms: PlatformId[];
  /** Product name or link — free text, sent as-is (trimmed). */
  product: string;
  name: string;
  email: string;
  brand: string;
  social: string;
  message: string;
};

/**
 * Keeps the thank-you screen after a refresh in the same tab. Only a flag is stored, never form data.
 * sessionStorage can throw (private mode, blocked storage): then the form simply starts at step 1.
 */
const SUBMITTED_KEY = "demoFormSubmitted";

function readSubmitted(): boolean {
  try {
    return window.sessionStorage.getItem(SUBMITTED_KEY) === "true";
  } catch {
    return false;
  }
}

function writeSubmitted(submitted: boolean) {
  try {
    if (submitted) window.sessionStorage.setItem(SUBMITTED_KEY, "true");
    else window.sessionStorage.removeItem(SUBMITTED_KEY);
  } catch {
    // Storage unavailable: nothing to persist.
  }
}

// The flag only changes through this component, which re-renders on those changes itself.
const subscribeToNothing = () => () => {};

const EMPTY_FIELDS: Fields = {
  contentType: null,
  platforms: [],
  product: "",
  name: "",
  email: "",
  brand: "",
  social: "",
  message: "",
};

function resolvePackageId(label: string | null): PackageOptionId | null {
  if (!label) return null;
  return (PACKAGE_OPTION_IDS as readonly string[]).includes(label)
    ? (label as PackageOptionId)
    : null;
}

const inputClass =
  "w-full rounded-xl border border-glass-border bg-graphite/80 px-4 py-3 text-sm tracking-normal text-foreground normal-case outline-none transition-colors placeholder:text-foreground-muted/50 focus-visible:border-gold/60 focus-visible:ring-2 focus-visible:ring-gold/25 disabled:opacity-60 aria-[invalid=true]:border-blush/70";

const labelClass =
  "flex flex-col gap-2 text-xs tracking-[0.14em] text-foreground-muted uppercase";

const choiceClass = (selected: boolean) =>
  `flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm text-foreground transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold/40 ${
    selected
      ? "border-gold/70 bg-gold/10"
      : "border-glass-border bg-graphite/60 hover:border-gold/35"
  }`;

const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-full px-4 py-3 text-xs font-medium tracking-widest text-foreground-muted uppercase transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:outline-none";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-xs tracking-normal text-blush normal-case">
      {message}
    </p>
  );
}

function StepHeading({
  id,
  headingRef,
  children,
}: {
  id: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
  children: ReactNode;
}) {
  return (
    <h3
      id={id}
      ref={headingRef}
      tabIndex={-1}
      className="font-display text-2xl leading-tight font-medium tracking-tight text-foreground outline-none md:text-[1.75rem]"
    >
      {children}
    </h3>
  );
}

export function Contact({
  instagramUrl,
  tiktokUrl,
  defaultContentType = null,
}: {
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  /** Service pages pre-select their own content type in step 1. */
  defaultContentType?: ContentTypeId | null;
}) {
  const initialFields: Fields = { ...EMPTY_FIELDS, contentType: defaultContentType };
  const t = useTranslations("Contact");
  const uid = useId();
  const { packageLabel, selectionVersion, clearPackage } = useSelectedPackage();
  const version = selectionVersion ?? 0;

  const [step, setStep] = useState<Step>(1);
  const [fields, setFields] = useState<Fields>(initialFields);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<FormStatus>("idle");
  const [packageId, setPackageId] = useState<PackageOptionId | null>(null);
  const [appliedVersion, setAppliedVersion] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const hasNavigated = useRef(false);
  const isSubmitting = status === "sending";
  // A request sent earlier in this tab keeps the thank-you screen after a refresh.
  // Server render and hydration use false; the stored flag is read right after.
  const submittedInSession = useSyncExternalStore(subscribeToNothing, readSubmitted, () => false);
  const isSuccess = status === "success" || submittedInSession;
  // Synchronous guard: React state is not updated yet on a fast double click / double Enter,
  // which would otherwise send the same request twice.
  const inFlight = useRef(false);

  // A pricing CTA picks a package and scrolls here; restart the flow if a request was already sent.
  if (appliedVersion !== version) {
    setAppliedVersion(version);
    setPackageId(resolvePackageId(packageLabel ?? null));
    // clearPackage() also bumps the version; only a fresh pick should leave the success state.
    if (isSuccess && packageLabel) {
      writeSubmitted(false);
      setStatus("idle");
      setStep(1);
    }
  }


  // Move focus to the new step's heading so keyboard and screen reader users land in context.
  // Panels swapped by AnimatePresence mount after the exit animation, so they also focus on enter.
  const focusHeading = () => {
    if (!hasNavigated.current) return;
    (isSuccess ? successRef : headingRef).current?.focus({ preventScroll: true });
  };
  useEffect(focusHeading, [step, isSuccess]);

  const id = (name: string) => `${uid}-${name}`;
  const update = <K extends keyof Fields>(key: K, value: Fields[K]) => {
    setFields((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };
  const togglePlatform = (platform: PlatformId) => {
    setFields((current) => ({
      ...current,
      platforms: current.platforms.includes(platform)
        ? current.platforms.filter((item) => item !== platform)
        : [...current.platforms, platform],
    }));
  };

  const validate = (current: Step): FieldErrors => {
    const next: FieldErrors = {};
    if (current === 1 && !fields.contentType) next.contentType = t("errors.contentType");
    if (current === 2) {
      if (!fields.product.trim()) next.product = t("errors.product");
    }
    if (current === 3) {
      if (!fields.name.trim()) next.name = t("errors.name");
      const email = fields.email.trim();
      if (!email) next.email = t("errors.email");
      else if (!EMAIL_RE.test(email)) next.email = t("invalidEmail");
    }
    return next;
  };

  const goTo = (next: Step) => {
    hasNavigated.current = true;
    setErrors({});
    if (status === "error") setStatus("idle");
    setStep(next);
  };

  const submit = async (honeypot: string) => {
    // Bots fill the hidden field: pretend success without sending anything.
    if (honeypot) {
      hasNavigated.current = true;
      setStatus("success");
      return;
    }

    if (inFlight.current) return;
    inFlight.current = true;
    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fields.name.trim(),
          email: fields.email.trim(),
          brand: fields.brand.trim(),
          social: fields.social.trim(),
          contentType: fields.contentType ? t(`contentTypes.${fields.contentType}`) : "",
          platforms: fields.platforms.map((platform) => t(`platforms.${platform}`)),
          product: fields.product.trim(),
          message: fields.message.trim(),
          package: packageId ? t(`packageOptions.${packageId}`) : "",
        }),
      });
      if (!response.ok) throw new Error("Request failed");

      hasNavigated.current = true;
      writeSubmitted(true);
      setStatus("success");
      setFields(initialFields);
      setPackageId(null);
      clearPackage();
    } catch {
      setStatus("error");
    } finally {
      inFlight.current = false;
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || inFlight.current) return;

    const found = validate(step);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      setErrors(found);
      document.getElementById(id(firstInvalid))?.focus();
      return;
    }
    if (step < 3) {
      goTo((step + 1) as Step);
      return;
    }
    const honeypot = String(new FormData(event.currentTarget).get("website_url") ?? "").trim();
    void submit(honeypot);
  };

  const restart = () => {
    hasNavigated.current = true;
    writeSubmitted(false);
    setFields(initialFields);
    setErrors({});
    setPackageId(null);
    setStatus("idle");
    setStep(1);
  };

  return (
    <section
      id="contact"
      className="relative z-20 scroll-mt-24 bg-transparent px-6 py-24 md:px-10 md:py-32 lg:px-12"
    >
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start lg:gap-20">
        <header className="relative z-20 rounded-xl backdrop-blur-sm lg:sticky lg:top-28">
          <p className="mb-4 text-xs tracking-[0.28em] text-gold uppercase md:text-sm">
            {t("kicker")}
          </p>
          <h2 className="font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.05] font-medium tracking-tight text-foreground">
            {t("title")}
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-foreground-muted md:text-lg">
            {t("intro")}
          </p>
          <p className="mt-6 text-xs tracking-[0.18em] text-foreground uppercase">
            {t("trustLine")}
          </p>
        </header>

        <div className="relative z-20 rounded-2xl border border-glass-border bg-glass/10 p-6 backdrop-blur-sm md:p-8">
          <AnimatePresence mode="wait" initial={false}>
            {isSuccess ? (
              <motion.div
                key="success"
                role="status"
                onAnimationComplete={focusHeading}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="py-4"
              >
                <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-gold/10">
                  <Check className="h-5 w-5 text-gold" strokeWidth={1.75} aria-hidden />
                </span>
                <h3
                  ref={successRef}
                  tabIndex={-1}
                  className="font-display text-2xl leading-tight font-medium tracking-tight text-foreground outline-none md:text-[1.75rem]"
                >
                  {t("success.title")}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground-muted md:text-base">
                  {t("success.body")}
                </p>
                {/* Primary: the portfolio page (works from every page that has this form). */}
                <div className="mt-8">
                  <Link
                    href="/portfolio"
                    className="inline-flex w-full items-center justify-center rounded-full border border-gold/50 px-6 py-3 text-xs font-medium tracking-widest text-gold uppercase transition-colors hover:border-gold hover:bg-gold/10 focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:outline-none sm:w-auto"
                  >
                    {t("success.portfolio")}
                  </Link>
                </div>
                {/* Secondary: socials — same URLs as the footer (site settings). */}
                {tiktokUrl || instagramUrl ? (
                  <ul aria-label={t("success.socialLabel")} className="mt-3 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
                    {[
                      { href: tiktokUrl, label: t("success.tiktok") },
                      { href: instagramUrl, label: t("success.instagram") },
                    ]
                      .filter((social): social is { href: string; label: string } => Boolean(social.href))
                      .map((social) => (
                        <li key={social.label}>
                          <a
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-glass-border px-6 py-3 text-xs font-medium tracking-widest text-foreground uppercase transition-colors hover:border-gold/50 hover:text-gold focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:outline-none"
                          >
                            {social.label} <span aria-hidden>↗</span>
                          </a>
                        </li>
                      ))}
                  </ul>
                ) : null}
                <button type="button" onClick={restart} className={`${secondaryButtonClass} mt-4 -ml-4`}>
                  {t("success.again")}
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={onSubmit}
                noValidate
                onAnimationComplete={focusHeading}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="mb-6">
                  <p className="text-[11px] tracking-[0.18em] text-foreground-muted uppercase">
                    {t("stepOf", { step, total: 3 })}
                  </p>
                  <div className="mt-2 flex gap-1.5" aria-hidden>
                    {[1, 2, 3].map((index) => (
                      <span
                        key={index}
                        className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${
                          index <= step ? "bg-gold" : "bg-glass-border"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {packageId ? (
                  <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-glass-border bg-graphite/60 px-4 py-2.5 text-sm text-foreground">
                    <span className="min-w-0">
                      <span className="text-foreground-muted">{t("packageChosen")} </span>
                      {t(`packageOptions.${packageId}`)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPackageId(null);
                        clearPackage();
                      }}
                      aria-label={t("packageRemove")}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-foreground-muted transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:outline-none"
                    >
                      <X className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                    </button>
                  </div>
                ) : null}

                {step === 1 ? (
                  <fieldset
                    aria-labelledby={id("step-title")}
                    aria-describedby={errors.contentType ? id("contentType-error") : undefined}
                  >
                    <StepHeading id={id("step-title")} headingRef={headingRef}>
                      {t("step1.title")}
                    </StepHeading>
                    <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                      {CONTENT_TYPES.map((type, index) => {
                        const selected = fields.contentType === type;
                        return (
                          <label
                            key={type}
                            className={`${choiceClass(selected)} ${type === "unsure" ? "sm:col-span-2" : ""}`}
                          >
                            <input
                              type="radio"
                              id={index === 0 ? id("contentType") : undefined}
                              name="contentType"
                              value={type}
                              checked={selected}
                              onChange={() => update("contentType", type)}
                              aria-describedby={errors.contentType ? id("contentType-error") : undefined}
                              className="sr-only"
                            />
                            <span
                              aria-hidden
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                selected ? "border-gold" : "border-foreground-muted/60"
                              }`}
                            >
                              {selected ? <span className="h-2 w-2 rounded-full bg-gold" /> : null}
                            </span>
                            {t(`contentTypes.${type}`)}
                          </label>
                        );
                      })}
                    </div>
                    <div className="mt-3">
                      <FieldError id={id("contentType-error")} message={errors.contentType} />
                    </div>
                  </fieldset>
                ) : null}

                {step === 2 ? (
                  <div>
                    <fieldset
                      aria-labelledby={id("step-title")}
                      aria-describedby={id("platforms-hint")}
                    >
                      <StepHeading id={id("step-title")} headingRef={headingRef}>
                        {t("step2.title")}
                      </StepHeading>
                      <p id={id("platforms-hint")} className="mt-2 text-sm text-foreground-muted">
                        {t("step2.hint")}
                      </p>
                      <div className="mt-5 grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2">
                        {PLATFORMS.map((platform) => {
                          const selected = fields.platforms.includes(platform);
                          return (
                            <label key={platform} className={choiceClass(selected)}>
                              <input
                                type="checkbox"
                                name="platforms"
                                value={platform}
                                checked={selected}
                                onChange={() => togglePlatform(platform)}
                                className="sr-only"
                              />
                              <span
                                aria-hidden
                                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border ${
                                  selected ? "border-gold bg-gold/15" : "border-foreground-muted/60"
                                }`}
                              >
                                {selected ? (
                                  <Check className="h-3 w-3 text-gold" strokeWidth={2.25} />
                                ) : null}
                              </span>
                              {t(`platforms.${platform}`)}
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>

                    <label htmlFor={id("product")} className={`${labelClass} mt-7`}>
                      {t("step2.productLabel")}
                    </label>
                    <p id={id("product-hint")} className="mt-1.5 text-xs text-foreground-muted">
                      {t("step2.productHint")}
                    </p>
                    <input
                      id={id("product")}
                      name="product"
                      type="text"
                      autoCapitalize="none"
                      spellCheck={false}
                      placeholder={t("step2.placeholder")}
                      value={fields.product}
                      onChange={(event) => update("product", event.target.value)}
                      aria-invalid={errors.product ? true : undefined}
                      aria-describedby={
                        errors.product ? `${id("product-hint")} ${id("product-error")}` : id("product-hint")
                      }
                      className={`${inputClass} mt-2`}
                    />
                    <div className="mt-2">
                      <FieldError id={id("product-error")} message={errors.product} />
                    </div>
                  </div>
                ) : null}

                {step === 3 ? (
                  <div>
                    <StepHeading id={id("step-title")} headingRef={headingRef}>
                      {t("step3.title")}
                    </StepHeading>

                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        <label htmlFor={id("name")} className={labelClass}>
                          {t("name")}
                        </label>
                        <input
                          id={id("name")}
                          name="name"
                          required
                          autoComplete="name"
                          value={fields.name}
                          onChange={(event) => update("name", event.target.value)}
                          disabled={isSubmitting}
                          aria-invalid={errors.name ? true : undefined}
                          aria-describedby={errors.name ? id("name-error") : undefined}
                          className={inputClass}
                        />
                        <FieldError id={id("name-error")} message={errors.name} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label htmlFor={id("email")} className={labelClass}>
                          {t("email")}
                        </label>
                        <input
                          id={id("email")}
                          name="email"
                          type="email"
                          required
                          autoComplete="email"
                          value={fields.email}
                          onChange={(event) => update("email", event.target.value)}
                          disabled={isSubmitting}
                          aria-invalid={errors.email ? true : undefined}
                          aria-describedby={errors.email ? id("email-error") : undefined}
                          className={inputClass}
                        />
                        <FieldError id={id("email-error")} message={errors.email} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label htmlFor={id("brand")} className={labelClass}>
                          {t("brand")} <span className="normal-case tracking-normal">{t("optional")}</span>
                        </label>
                        <input
                          id={id("brand")}
                          name="brand"
                          autoComplete="organization"
                          value={fields.brand}
                          onChange={(event) => update("brand", event.target.value)}
                          disabled={isSubmitting}
                          className={inputClass}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label htmlFor={id("social")} className={labelClass}>
                          {t("social")} <span className="normal-case tracking-normal">{t("optional")}</span>
                        </label>
                        <input
                          id={id("social")}
                          name="social"
                          type="text"
                          inputMode="url"
                          autoCapitalize="none"
                          spellCheck={false}
                          value={fields.social}
                          onChange={(event) => update("social", event.target.value)}
                          disabled={isSubmitting}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-2">
                      <label htmlFor={id("message")} className={labelClass}>
                        {t("note")} <span className="normal-case tracking-normal">{t("optional")}</span>
                      </label>
                      <textarea
                        id={id("message")}
                        name="message"
                        rows={3}
                        value={fields.message}
                        onChange={(event) => update("message", event.target.value)}
                        disabled={isSubmitting}
                        className={`${inputClass} resize-y`}
                      />
                    </div>
                  </div>
                ) : null}

                {/* Honeypot: hidden from people and assistive tech, filled only by bots. */}
                <input
                  type="text"
                  name="website_url"
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={() => goTo((step - 1) as Step)}
                      disabled={isSubmitting}
                      className={secondaryButtonClass}
                    >
                      {t("back")}
                    </button>
                  ) : (
                    <span className="hidden sm:block" />
                  )}
                  {step < 3 ? (
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-full border border-gold/50 px-8 py-3 text-xs font-medium tracking-widest text-gold uppercase transition-colors hover:border-gold hover:bg-gold/10 focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:outline-none sm:min-w-44"
                    >
                      {t("next")}
                    </button>
                  ) : (
                    <FormSubmitButton
                      className="focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:outline-none sm:w-auto sm:px-8"
                      isSubmitting={isSubmitting}
                      idleLabel={t("cta")}
                      sendingLabel={t("sending")}
                    />
                  )}
                </div>

                {step === 3 ? (
                  <div className="mt-5 space-y-0.5 text-xs leading-relaxed text-foreground-muted">
                    <p>{t("conditions.one")}</p>
                    <p>{t("conditions.two")}</p>
                    <p>{t("conditions.three")}</p>
                  </div>
                ) : null}

                {status === "error" ? (
                  <p role="alert" className="mt-4 text-sm text-blush">
                    {t("error")}
                  </p>
                ) : null}
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
