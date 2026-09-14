import { getTranslations, setRequestLocale } from "next-intl/server";
import { PrivacyContent } from "@/components/PrivacyContent";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Privacy" });
  return {
    title: t("title"),
    description: t("intro"),
  };
}

export default async function PrivacyPolicyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="relative z-20 flex-1 px-6 pt-28 pb-24 md:px-10 md:pt-32 md:pb-32 lg:px-12">
      <PrivacyContent />
    </main>
  );
}
