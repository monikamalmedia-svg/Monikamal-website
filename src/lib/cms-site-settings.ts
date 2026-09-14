import { cache } from "react";
import { client } from "@/lib/sanity";
import { WHATSAPP_NUMBER } from "@/lib/site";

export type SiteSettingsDoc = {
  whatsappNumber?: string | null;
  contactEmail?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  linkedinUrl?: string | null;
  footerTaglineEn?: string | null;
  footerTaglineNl?: string | null;
};

export type ResolvedSiteSettings = {
  whatsappNumber: string;
  contactEmail: string | null;
  instagramUrl: string;
  tiktokUrl: string;
  linkedinUrl: string;
  footerTaglineEn: string | null;
  footerTaglineNl: string | null;
};

export const SITE_SETTINGS_QUERY = `*[_type == "siteSettings"][0]{
  whatsappNumber,
  contactEmail,
  instagramUrl,
  tiktokUrl,
  linkedinUrl,
  footerTaglineEn,
  footerTaglineNl
}`;

export const DEFAULT_SOCIALS = {
  instagramUrl: "https://www.instagram.com/monika.mmedia/",
  linkedinUrl:
    "https://www.linkedin.com/in/monika-malinovskaja-797a472a8?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
  tiktokUrl: "https://www.tiktok.com/@ugcflow.by.monika",
} as const;

function digits(value?: string | null): string {
  return (value ?? "").replace(/\D/g, "");
}

export function resolveSiteSettings(
  doc: SiteSettingsDoc | null,
): ResolvedSiteSettings {
  return {
    whatsappNumber: digits(doc?.whatsappNumber) || WHATSAPP_NUMBER,
    contactEmail: doc?.contactEmail?.trim() || null,
    instagramUrl: doc?.instagramUrl?.trim() || DEFAULT_SOCIALS.instagramUrl,
    tiktokUrl: doc?.tiktokUrl?.trim() || DEFAULT_SOCIALS.tiktokUrl,
    linkedinUrl: doc?.linkedinUrl?.trim() || DEFAULT_SOCIALS.linkedinUrl,
    footerTaglineEn: doc?.footerTaglineEn?.trim() || null,
    footerTaglineNl: doc?.footerTaglineNl?.trim() || null,
  };
}

export const fetchSiteSettings = cache(async (): Promise<ResolvedSiteSettings> => {
  try {
    const doc = await client.fetch<SiteSettingsDoc | null>(SITE_SETTINGS_QUERY);
    return resolveSiteSettings(doc);
  } catch {
    return resolveSiteSettings(null);
  }
});
