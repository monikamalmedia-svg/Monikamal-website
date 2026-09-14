"use client";

import { FormEvent, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { FormSubmitButton, FormSuccessPanel } from "@/components/ContactFormStates";
import { useSelectedPackage } from "@/context/SelectedPackageContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PACKAGE_OPTION_IDS = [
  "none",
  "starter",
  "growth",
  "partnership",
  "photographyFive",
  "photographyTen",
] as const;

type PackageOptionId = (typeof PACKAGE_OPTION_IDS)[number];
type FormStatus = "idle" | "sending" | "success" | "error";

function isPackageOptionId(value: string): value is PackageOptionId {
  return PACKAGE_OPTION_IDS.includes(value as PackageOptionId);
}

function resolvePackageId(label: string | null): PackageOptionId {
  if (!label) return "none";
  if (isPackageOptionId(label)) return label;

  const normalized = label.toLowerCase();
  if (normalized.includes("starter")) return "starter";
  if (normalized.includes("growth")) return "growth";
  if (normalized.includes("partnership") || normalized.includes("samenwerking")) {
    return "partnership";
  }
  if (normalized.includes("10") && (normalized.includes("photo") || normalized.includes("foto"))) {
    return "photographyTen";
  }
  if (normalized.includes("5") && (normalized.includes("photo") || normalized.includes("foto"))) {
    return "photographyFive";
  }

  return "none";
}

export function Contact() {
  const t = useTranslations("Contact");
  const { packageLabel, selectionVersion, clearPackage } = useSelectedPackage();
  const version = selectionVersion ?? 0;
  const [status, setStatus] = useState<FormStatus>("idle");
  const [feedback, setFeedback] = useState("");
  const [selectedPackageId, setSelectedPackageId] =
    useState<PackageOptionId>("none");
  const [appliedVersion, setAppliedVersion] = useState(0);
  const isSubmitting = status === "sending";

  if (appliedVersion !== version) {
    setAppliedVersion(version);
    setSelectedPackageId(resolvePackageId(packageLabel ?? null));
    if (status === "success") {
      setStatus("idle");
      setFeedback("");
    }
  }

  const packageOptions = useMemo(
    () =>
      PACKAGE_OPTION_IDS.map((id) => ({
        id,
        label: t(`packageOptions.${id}`),
      })),
    [t],
  );

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const brand = String(data.get("brand") ?? "").trim();
    const selectedPackage = String(data.get("package") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const websiteUrl = String(data.get("website_url") ?? "").trim();

    if (websiteUrl) {
      form.reset();
      clearPackage();
      setSelectedPackageId("none");
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
          brand,
          package: selectedPackage,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      form.reset();
      clearPackage();
      setSelectedPackageId("none");
      setFeedback("");
      setStatus("success");
    } catch {
      setStatus("error");
      setFeedback(t("error"));
    }
  };

  return (
    <section
      id="contact"
      className="relative z-20 scroll-mt-24 bg-transparent px-6 py-24 md:px-10 md:py-32 lg:px-12"
    >
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start lg:gap-20">
        <header className="relative z-20 rounded-xl backdrop-blur-sm">
          <p className="mb-4 text-xs tracking-[0.28em] text-gold uppercase md:text-sm">
            {t("kicker")}
          </p>
          <h2 className="font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.05] font-medium tracking-tight text-foreground">
            {t("title")}
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-foreground-muted md:text-lg">
            {t("intro")}
          </p>
        </header>

        <form
          onSubmit={onSubmit}
          noValidate
          className="relative z-20 rounded-2xl border border-glass-border bg-glass/10 p-6 backdrop-blur-sm md:p-8"
        >
          <AnimatePresence mode="wait" initial={false}>
            {status === "success" ? (
              <FormSuccessPanel key="success" message={t("success")} />
            ) : (
              <motion.div
                key="fields"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="grid gap-5 sm:grid-cols-2">
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
                </div>

                <label className="mt-5 flex flex-col gap-2 text-xs tracking-[0.14em] text-foreground-muted uppercase">
                  {t("brand")}
                  <input
                    name="brand"
                    autoComplete="organization"
                    disabled={isSubmitting}
                    className="rounded-xl border border-glass-border bg-graphite/80 px-4 py-3 text-sm tracking-normal text-foreground normal-case outline-none transition-colors focus:border-blush/40 disabled:opacity-60"
                  />
                </label>

                <label className="mt-5 flex flex-col gap-2 text-xs tracking-[0.14em] text-foreground-muted uppercase">
                  {t("package")}
                  <span className="relative">
                    <select
                      name="package"
                      value={t(`packageOptions.${selectedPackageId}`)}
                      disabled={isSubmitting}
                      onChange={(event) => {
                        const nextLabel = event.target.value;
                        const next = packageOptions.find(
                          (option) => option.label === nextLabel,
                        );
                        setSelectedPackageId(next?.id ?? "none");
                      }}
                      className="w-full appearance-none rounded-xl border border-glass-border bg-graphite/80 px-4 py-3 pr-11 text-sm tracking-normal text-foreground normal-case outline-none transition-colors focus:border-blush disabled:opacity-60"
                    >
                      {packageOptions.map((option) => (
                        <option
                          key={option.id}
                          value={option.label}
                          className="bg-graphite text-foreground"
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-foreground-muted"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  </span>
                </label>

                <input
                  type="text"
                  name="website_url"
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                <label className="mt-5 flex flex-col gap-2 text-xs tracking-[0.14em] text-foreground-muted uppercase">
                  {t("message")}
                  <textarea
                    name="message"
                    required
                    rows={5}
                    disabled={isSubmitting}
                    className="resize-y rounded-xl border border-glass-border bg-graphite/80 px-4 py-3 text-sm tracking-normal text-foreground normal-case outline-none transition-colors focus:border-blush/40 disabled:opacity-60"
                  />
                </label>

                <FormSubmitButton
                  className="mt-8"
                  isSubmitting={isSubmitting}
                  idleLabel={t("cta")}
                  sendingLabel={t("sending")}
                />

                {feedback && status === "error" ? (
                  <p role="status" className="mt-4 text-sm text-blush">
                    {feedback}
                  </p>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </section>
  );
}
