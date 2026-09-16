import { getLocale, getTranslations } from "next-intl/server";
import { FaqView } from "@/components/FaqView";
import {
  cmsHeading,
  FAQ_FALLBACK_IDS,
  FAQ_SECTION_QUERY,
  mapFaqQuestions,
  type DisplayFaqItem,
  type FaqSectionDoc,
} from "@/lib/cms-faq";
import { client } from "@/lib/sanity";

async function fetchFaqSection(): Promise<FaqSectionDoc | null> {
  try {
    return await client.fetch<FaqSectionDoc | null>(FAQ_SECTION_QUERY);
  } catch {
    return null;
  }
}

function overlayFaqCopy(
  items: DisplayFaqItem[],
  t: Awaited<ReturnType<typeof getTranslations>>,
): DisplayFaqItem[] {
  return items.map((item) => {
    const hay = item.question.toLowerCase();
    if (
      hay.includes("physical product") ||
      hay.includes("fysieke product")
    ) {
      return {
        ...item,
        question: t("items.product.question"),
        answer: t.raw("items.product.answer") as string,
      };
    }
    if (hay.includes("revision") || hay.includes("revisie")) {
      return {
        ...item,
        question: t("items.revisions.question"),
        answer: t.raw("items.revisions.answer") as string,
      };
    }
    return item;
  });
}

export async function Faq() {
  const locale = await getLocale();
  const isNl = locale === "nl";
  const t = await getTranslations("Faq");
  const doc = await fetchFaqSection();

  const fallbackItems: DisplayFaqItem[] = FAQ_FALLBACK_IDS.map((id) => ({
    id,
    question: t(`items.${id}.question`),
    answer: t.raw(`items.${id}.answer`) as string,
  }));

  const cmsItems = mapFaqQuestions(isNl, doc?.questions);
  const heading = cmsHeading(isNl, doc?.headingEn, doc?.headingNl) || t("title");
  const subheading =
    cmsHeading(isNl, doc?.subheadingEn, doc?.subheadingNl) || t("intro");
  const items = overlayFaqCopy(
    cmsItems.length > 0 ? cmsItems : fallbackItems,
    t,
  );

  return (
    <FaqView
      kicker={t("kicker")}
      heading={heading}
      subheading={subheading}
      items={items}
    />
  );
}
