import { getTranslations } from "next-intl/server";
import { COOKIE_ROWS } from "@/lib/cookie-consent";
import { CookieSettingsButton } from "@/components/CookieBanner";

export async function PrivacyContent() {
  const t = await getTranslations("Privacy");

  return (
    <article className="mx-auto max-w-3xl">
      <p className="mb-4 text-xs tracking-[0.28em] text-gold uppercase">
        {t("kicker")}
      </p>
      <h1 className="font-display text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.05] font-medium tracking-tight text-foreground">
        {t("title")}
      </h1>
      <p className="mt-6 text-sm text-foreground-muted">{t("updated")}</p>
      <div className="mt-10 space-y-8 text-base leading-relaxed text-foreground-muted">
        <p>{t("intro")}</p>
        <section>
          <h2 className="font-display mb-3 text-2xl text-foreground">
            {t("sections.data.title")}
          </h2>
          <p>{t("sections.data.body")}</p>
        </section>
        <section>
          <h2 className="font-display mb-3 text-2xl text-foreground">
            {t("sections.intellectual.title")}
          </h2>
          <p>{t("sections.intellectual.body")}</p>
        </section>
        <section>
          <h2 className="font-display mb-3 text-2xl text-foreground">
            {t("sections.cookies.title")}
          </h2>
          <p>{t("sections.cookies.body")}</p>

          <div className="mt-6 space-y-5">
            {/* TODO: update this text with real service names once Google Analytics/Meta Pixel/etc. are actually integrated */}
            {(["necessary", "analytics", "marketing"] as const).map((id) => (
              <div key={id}>
                <h3 className="text-sm font-medium tracking-[0.08em] text-gold uppercase">
                  {t(`categories.${id}.title`)}
                </h3>
                <p className="mt-2 text-sm">{t(`categories.${id}.body`)}</p>
              </div>
            ))}
          </div>

          <h3 className="font-display mt-10 mb-3 text-xl text-foreground">
            {t("cookieTable.title")}
          </h3>
          <p className="mb-4 text-sm">{t("cookieTable.intro")}</p>

          <div className="overflow-x-auto rounded-2xl border border-glass-border">
            <table className="min-w-[40rem] w-full border-collapse text-left text-sm">
              <thead className="bg-graphite text-xs tracking-[0.12em] text-gold uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">{t("cookieTable.headers.name")}</th>
                  <th className="px-4 py-3 font-medium">
                    {t("cookieTable.headers.provider")}
                  </th>
                  <th className="px-4 py-3 font-medium">
                    {t("cookieTable.headers.purpose")}
                  </th>
                  <th className="px-4 py-3 font-medium">
                    {t("cookieTable.headers.expiry")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {COOKIE_ROWS.map((row) => (
                  <tr
                    key={row.name}
                    className="border-t border-glass-border align-top"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-foreground">
                      {row.name}
                    </td>
                    <td className="px-4 py-3">{row.provider}</td>
                    <td className="px-4 py-3">
                      {t(`cookieTable.purposes.${row.purposeKey}`)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {t(`cookieTable.expiry.${row.expiryKey}`)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-5">
            <CookieSettingsButton className="text-gold underline-offset-4 hover:underline" />
          </p>
        </section>
        <section>
          <h2 className="font-display mb-3 text-2xl text-foreground">
            {t("sections.analytics.title")}
          </h2>
          <p>{t("sections.analytics.body")}</p>
        </section>
        <section>
          <h2 className="font-display mb-3 text-2xl text-foreground">
            {t("sections.contact.title")}
          </h2>
          <p>{t("sections.contact.body")}</p>
        </section>
      </div>
    </article>
  );
}
