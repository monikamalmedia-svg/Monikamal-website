import { getLocale, getTranslations } from "next-intl/server";
import { FooterView } from "@/components/FooterView";
import { fetchSiteSettings } from "@/lib/cms-site-settings";

export async function Footer() {
  const locale = await getLocale();
  const t = await getTranslations("Footer");
  const settings = await fetchSiteSettings();
  const tagline =
    (locale === "nl" ? settings.footerTaglineNl : settings.footerTaglineEn) ||
    t("tagline");

  return (
    <FooterView
      tagline={tagline}
      contactEmail={settings.contactEmail}
      instagramUrl={settings.instagramUrl}
      linkedinUrl={settings.linkedinUrl}
      tiktokUrl={settings.tiktokUrl}
    />
  );
}
