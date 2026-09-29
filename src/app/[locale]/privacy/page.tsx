import { getTranslations, setRequestLocale } from "next-intl/server";
import { PrivacyContent } from "@/components/PrivacyContent";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/services";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Privacy" });
  return pageMetadata({
    locale: locale as Locale,
    paths: { en: "/privacy", nl: "/privacy" },
    title: `${t("title")} | Monika Mal`,
    description: t("intro"),
    // Duplicate of /privacy-policy (the page the footer links to).
    canonicalPaths: { en: "/privacy-policy", nl: "/privacy-policy" },
  });
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="relative z-20 flex-1 px-6 pt-28 pb-24 md:px-10 md:pt-32 md:pb-32 lg:px-12">
      <PrivacyContent />
    </main>
  );
}
