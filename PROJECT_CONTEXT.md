# PROJECT_CONTEXT — Monika Mal Media

Cinematic AI commercials for e-commerce. Locales **en** (default) / **nl**. Copy: `src/messages/en.json`, `src/messages/nl.json`. Domain **monikamalmedia.com is not purchased**. `SITE_URL` fallback: `https://monikamal.com` (`src/lib/site.ts`). Brand: `/logo.png`, `/favicon.ico`, `/favicon-32x32.png`, `/favicon-16x16.png`, `/apple-touch-icon.png`, `/site.webmanifest`, `/og-image.jpg`.

Contact / Get in touch do **not** show a studio email. Inbox: **`monikamalmedia@gmail.com`** via Resend. Footer mailto only if `siteSettings.contactEmail` is set. Privacy contact is gmail. `INQUIRY_EMAIL` in `src/lib/site.ts` is not rendered on Contact.

## Stack

Next.js **16** App Router (`src/app`), React 19, TS, Tailwind **v4**, Framer Motion, Lucide, next-intl, Sanity (`next-sanity` + Studio `/studio`), Resend, PostHog (`src/app/providers.tsx`, keys `NEXT_PUBLIC_POSTHOG_*`). Flags: `country-flag-icons`. `next.config.ts`: `createNextIntlPlugin("./src/i18n/request.ts")`; headers `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`. Next 16 may warn `middleware.ts` → `proxy.ts` (not done).

## Palette (`src/app/globals.css`)

`:root` + `@theme inline`. `html`/`body`: **`overflow-x: clip`**. Page fill is body `bg-background`; section shells `bg-transparent` so grain/grid show through.

| Token | Hex | Use |
| --- | --- | --- |
| `--background` | `#1E040C` | page |
| `--graphite` | `#0F0206` | cards / footer |
| `--glass` | `#2D0915` | glass fills |
| `--glass-border` | `#5C1D31` | borders |
| `--blush` | `#E8A5B8` | accent |
| `--gold` | `#D4AF37` | accent / CTA |
| `--foreground` | `#EDE6E8` | body |
| `--foreground-muted` | `#A8949B` | secondary |

Fonts: **Manrope** → `--font-sans`, **Cormorant Garamond** → `--font-display` / `--font-serif`. `@utility font-display`. Shadows: `--shadow-gold-glow`; classes `.shadow-gold-glow`, `.shadow-burgundy-glow`. Extra: `.glow-border-card` (conic gold→blush 5s; Growth + 10 photos; reduced-motion off); `.trust-marquee` (42s / 32s mobile, hover pause); `.film-grain-overlay` (SVG noise 0.04). Tailwind arbitrary `rgba()` shadows need **underscores**.

## i18n (next-intl)

- `src/i18n/routing.ts` — `en` / `nl`, default `en`
- `src/i18n/request.ts` — `src/messages/{locale}.json`
- `src/i18n/navigation.ts` — locale-aware `Link` / router
- `src/middleware.ts` — matcher excludes `api`, `trpc`, `_next`, `_vercel`, `studio`, `opengraph-image`, `twitter-image`, `icon`, `.*\\..*`

UI copy: `useTranslations()` / `getTranslations()`. Namespace **Faq** (not `faq`).

## App structure

**Root** `src/app/layout.tsx`: fonts, `globals.css`, `CSPostHogProvider`, `lang` from `getLocale()` (fallback `en` for `/studio`). Icons + OG as above.

**Locale** `src/app/[locale]/layout.tsx`: `NextIntlClientProvider` → `SelectedPackageProvider` → `CookieConsentProvider` → `DisableRightClick` → `ScrollRoot` → grain + cursor grid → `Navbar` → page → `Footer` + WhatsApp + CookieBanner + ConsentScripts. No ScrollToTop button.

**Home:** GROQ `heroSection` + featured `caseStudy` → Hero → TrustBar (`#brands`) → CommercialPortfolio → AIPipeline → Pricing → PhotoPricing → Faq → Contact.

**About** `/about`: GROQ `aboutPage` portrait video. Heading CMS or JSON. **Lead/body are i18n** (`About.lead` = “I'm Monika, an AI Visual Director…” — no surname; NL “Ik ben Monika”). CMS `bioEn`/`bioNl` exist in Studio but are **not rendered**. Empty work samples → JSON placeholders. CTA `/#contact`.

**Privacy:** `/privacy` and `/privacy-policy`. **404:** root EN + locale `NotFoundView`. **Studio:** `src/app/studio/[[...tool]]/page.tsx` at `/studio` (outside `[locale]`).

**API** `POST /api/contact` → Resend (`src/app/api/contact/route.ts`).

## Sanity CMS

Studio **works** at `/studio`. Client: `src/sanity/lib/client.ts`; `urlFor` `src/sanity/lib/image.ts`; re-export `src/lib/sanity.ts`. Schemas: `src/sanity/schemaTypes/` (`heroSection`, `aboutPage`, `pricingSection`, `photoPricingSection`, `faqSection`, `siteSettings`, `caseStudy`). Structure: `src/sanity/structure.ts`. Singletons cannot be duplicated.

| Doc | Wired? | Notes |
| --- | --- | --- |
| `heroSection` | Yes | Kicker/headline/sub + showreel. Empty copy → `Hero.*`. **No video → picsum.photos/1920/1080.** Headline trailing `.` stripped in `page.tsx`. |
| `aboutPage` | Partial | Portrait video wired. Bio fields unused. Empty samples → demo titles. |
| `pricingSection` | Yes | Empty → JSON Starter / Growth / Partnership. |
| `photoPricingSection` | Yes | Empty → 5 / 10 photos JSON. |
| `faqSection` | Yes | Empty → JSON FAQ. Optional `<hl>` gold. |
| `siteSettings` | Yes | WhatsApp, socials, tagline, optional footer email. WhatsApp fallback `31626768814`. |
| `caseStudy` | Yes | Homepage: `featured == true` ordered by `displayOrder`. `mediaType` video/photo. **Empty featured videos → empty AI Videos grid.** **No photo docs → Unsplash photo placeholders.** |

Former **Custom** video pack is **Partnership**.

## Contact + Resend + package handoff

- **Contact.tsx:** name, email, brand, package `<select>`, message. No mailto. POST translated package **label**.
- **GetInTouchModal:** name, email, project. POST `package: "Custom request"`.
- **Resend:** `RESEND_API_KEY` required. **To** `monikamalmedia@gmail.com`. **From** `Monika Mal <onboarding@resend.dev>` until domain verified (`hello@monikamalmedia.com`). `replyTo` = visitor. Subject `[Inquiry] {name} — {brand} ({time})`. HTML (RU labels): имя, email, бренд, пакет, сообщение.
- **SelectedPackageContext:** Pricing/Photo `selectPackage(id)` (`starter` \| `growth` \| `partnership` \| `photographyFive` \| `photographyTen`) → scroll `#contact`. `clearPackage` after successful Contact submit.

## Navbar / CTAs

Hashes: `#portfolio`, `#pipeline`, `#pricing`, `#faq`. About → `/about`. Right: LanguageSwitcher + Get in touch (modal). Mobile: compact lang + burger (`lg` shows desktop nav + CTA). Hero **Book a project** → `#pricing`; **View work** → `#portfolio`. Nav `z-50`.

## Components (`src/components/`)

| File | Content |
| --- | --- |
| `Hero.tsx` | Full-viewport. CMS showreel or picsum; CTAs as above. |
| `ShowreelPlayer.tsx` | Unused by Hero; kept. |
| `TrustBar.tsx` | `#brands` marquee. Logos `/logos/celsius.png`, `clearly.svg`, `rituals.png`, `trueseamoss.png`. |
| `CommercialPortfolio.tsx` | Tabs AI Videos / AI Photos. Sanity items. Photos always visible; click → lightbox. Mobile videos: 1 col, `max-w-[16.5rem]`; desktop 280/320px, sticky groups lg 3 / md 2. Modal `z-[60]`. |
| `AIPipeline.tsx` | Brief → Concept → Production → Delivery. `#pipeline`. |
| `Pricing.tsx` / `PricingView.tsx` | CMS or JSON. CTA Choose package / Kies pakket. Popular + glow (fallback Growth). |
| `PhotoPricing.tsx` / `PhotoPricingView.tsx` | CMS or JSON 5/10 photos. Better value + glow (fallback 10). |
| `Faq.tsx` / `FaqView.tsx` | CMS or JSON accordion `#faq`. |
| `Contact.tsx` / `ContactFormStates.tsx` | Brief + Resend. |
| `GetInTouchModal.tsx` | Nav inquiry. |
| `AboutMeVideoPlayer.tsx` | Autoplay, no loop. Mute + Replay **transparent** (no fill/border). Play pause still uses shared glass chrome. |
| `Footer.tsx` / `FooterView.tsx` | CMS settings. Credit **Designed & Built by Savo** → `wa.me/31620329683`. |
| `Navbar.tsx` / `LanguageSwitcher.tsx` | Sticky EN/NL. |
| `CookieBanner.tsx` + consent ctx | Cookie + localStorage. |
| `ConsentScripts.tsx` | GA / Meta / TikTok if IDs **and** consent (`src/lib/tracking.ts`). |
| `WhatsAppButton.tsx` | Fixed `z-40`. |
| `ProtectedVideo` / `ProtectedImage` / `DisableRightClick` | Casual anti-save. |
| `videoControlStyles.ts` | Shared Play/Pause/Mute glass class (portfolio / showreel). |
| `HomeHashScroll` / `NotFoundView` / `PrivacyContent` | Hash restore; 404; privacy + analytics copy. |

Lib: `site.ts`, `cookie-consent.ts`, `tracking.ts`, `sanity.ts`, `sanity-media.ts`, `portfolio.ts`, `cms-pricing.ts`, `cms-faq.ts`, `cms-site-settings.ts`.

### Video packages (JSON fallback)

1. **Starter** — €400. 1 commercial ≤30s, 1 avatar, **2 revisions**, 3–5 days.
2. **Growth** — €700. Popular. 2 videos + hooks, ASMR/craft, 2 revisions, 6–10 business days.
3. **Partnership** (NL **Samenwerking**) — **€1,200/month**, **€300/video**, **4 videos/month**, priority + calendar slot, 2 revisions each.

Photo: 5 / €100 and 10 / €150.

## Design rules

Blush/gold = accents. Prefer theme tokens over one-off amber except Hero neon. Stack: grain `z-[1]`, grid `z-[2]`, content `z-20+`, floats `z-40`, nav `z-50`, modals `z-[60]`+. `select-none` on media only.

## Open / next

- Publish **featured** `caseStudy` docs (video/photo + thumbnail) so Portfolio isn’t empty / isn’t Unsplash photos.
- Real **Hero** showreel in Studio (empty → picsum). About Selected work still placeholders if CMS samples empty. Studio bio unused — site copy is i18n.
- Buy/verify **monikamalmedia.com**; set `NEXT_PUBLIC_SITE_URL`; Resend `from` → branded sender.
- Fill `siteSettings`. Set GA/Meta/TikTok IDs only with consent. PostHog keys in `.env.local`.
- Dev: LanguageSwitcher hydration; Next 16 middleware → proxy.
