import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pagePath, type Locale } from "@/lib/services";

type PageLinkKey = "process" | "work" | "about" | "services";

/**
 * A compact row of related pages, placed above the contact section (on the page background —
 * never as a separate band between contact and footer).
 */
export async function PageLinks({ items }: { items: PageLinkKey[] }) {
  const t = await getTranslations("PageLinks");
  const locale = (await getLocale()) as Locale;
  const href: Record<PageLinkKey, string> = {
    process: pagePath("howItWorks", locale),
    work: "/portfolio",
    about: "/about",
    services: pagePath("hub", locale),
  };

  return (
    <nav aria-label={t("label")} className="relative z-20 px-6 md:px-10 lg:px-12">
      <ul className="mx-auto flex max-w-6xl flex-wrap gap-x-8 gap-y-1 border-t border-white/12 pt-6">
        {items.map((key) => (
          <li key={key}>
            <Link
              href={href[key]}
              className="group inline-flex items-center gap-2 py-2 text-base text-gold underline-offset-[6px] transition-colors hover:text-ivory-strong hover:underline focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:outline-none"
            >
              {t(key)}
              <span aria-hidden className="text-sm transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
