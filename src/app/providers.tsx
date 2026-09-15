"use client";

import { type ReactNode, useEffect, useState } from "react";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import {
  CONSENT_EVENT,
  allowsAnalytics,
  loadStoredConsent,
} from "@/lib/cookie-consent";

type Props = {
  children: ReactNode;
};

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
      if (posthog.__loaded) {
        posthog.opt_out_capturing();
      }
      return;
    }

    if (!posthog.__loaded) {
      posthog.init(key, {
        api_host: host,
        person_profiles: "identified_only",
      });
      return;
    }

    posthog.opt_in_capturing();
  }, [analyticsAllowed]);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
