"use client";

import { type ReactNode, useEffect, useState } from "react";
import type { PostHog } from "posthog-js";
import {
  CONSENT_EVENT,
  allowsAnalytics,
  loadStoredConsent,
} from "@/lib/cookie-consent";

type Props = {
  children: ReactNode;
};

// Loaded on first analytics consent only, so visitors without consent never download PostHog.
let posthogPromise: Promise<PostHog> | null = null;

function loadPosthog(): Promise<PostHog> {
  posthogPromise ??= import("posthog-js").then((module) => module.default);
  return posthogPromise;
}

export function CSPostHogProvider({ children }: Props) {
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  useEffect(() => {
    const sync = () => {
      setAnalyticsAllowed(allowsAnalytics(loadStoredConsent()));
    };
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
    if (!key || !host) return;

    if (!analyticsAllowed) {
      // Only opt out if PostHog was already loaded earlier in this visit.
      if (posthogPromise) {
        void posthogPromise.then((posthog) => {
          if (posthog.__loaded) posthog.opt_out_capturing();
        });
      }
      return;
    }

    void loadPosthog().then((posthog) => {
      if (!posthog.__loaded) {
        posthog.init(key, {
          api_host: host,
          person_profiles: "identified_only",
        });
        return;
      }
      posthog.opt_in_capturing();
    });
  }, [analyticsAllowed]);

  return <>{children}</>;
}
