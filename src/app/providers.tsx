"use client";

import { type ReactNode, useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

type Props = {
  children: ReactNode;
};

export function CSPostHogProvider({ children }: Props) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
    if (!key || !host) return;

    posthog.init(key, {
      api_host: host,
      person_profiles: "identified_only",
    });
  }, []);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
