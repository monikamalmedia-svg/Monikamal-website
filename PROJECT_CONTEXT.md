# PROJECT_CONTEXT — Monika Mal Media

Cinematic AI commercials for e-commerce. Locales **en** (default) / **nl**. Copy: `src/messages/en.json`, `src/messages/nl.json`. Domain **monikamalmedia.com is not purchased**. `SITE_URL` fallback: `https://monikamal.com` (`src/lib/site.ts`). Brand files: `/logo.png`, `/favicon.ico`, `/favicon-32x32.png`, `/favicon-16x16.png`, `/apple-touch-icon.png`, `/site.webmanifest`, `/og-image.jpg`.

**No studio email on Contact / Get in touch.** Inbox **`monikamalmedia@gmail.com`** via Resend. Footer mailto only if `siteSettings.contactEmail` is set. Privacy uses gmail. `INQUIRY_EMAIL` in `src/lib/site.ts` is not rendered on Contact.

## Stack

Next.js **16** App Router (`src/app`), React 19, TS, Tailwind **v4**, Framer Motion, Lucide, next-intl, Sanity (`next-sanity` + Studio `/studio`), Resend, PostHog (`src/app/providers.tsx`, `NEXT_PUBLIC_POSTHOG_*`). Flags: `country-flag-icons`. `next.config.ts`: `createNextIntlPlugin("./src/i18n/request.ts")`; headers `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`. Next 16 may warn `middleware.ts` → `proxy.ts` (not migrated).

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

Fonts: **Manrope** → `--font-sans`, **Cormorant Garamond** → `--font-display` / `--font-serif`. `@utility font-display`. Shadows: `--shadow-gold-glow`; `.shadow-gold-glow`, `.shadow-burgundy-glow`. Extra: `.glow-border-card` (Growth + 10 photos); `.trust-marquee`; `.film-grain-overlay`. Tailwind arbitrary `rgba()` shadows need **underscores**.

## i18n (next-intl)

- `src/i18n/routing.ts` — `en` / `nl`, default `en`
- `src/i18n/request.ts` — `src/messages/{locale}.json`
- `src/i18n/navigation.ts` — locale-aware `Link` / router
- `src/middleware.ts` — matcher excludes `api`, `trpc`, `_next`, `_vercel`, `studio`, `opengraph-image`, `twitter-image`, `icon`, `.*\\..*`

UI: `useTranslations()` / `getTranslations()`. Namespace **Faq** (not `faq`).

## App structure

**Root** `src/app/layout.tsx`: fonts, `globals.css`, `CSPostHogProvider`, `lang` from `getLocale()` (fallback `en` for `/studio`). Icons + OG as above.

**Locale** `src/app/[locale]/layout.tsx`: `NextIntlClientProvider` → `SelectedPackageProvider` → `CookieConsentProvider` → `DisableRightClick` → `ScrollRoot` → grain + cursor grid → `Navbar` → page → `Footer` + WhatsApp + CookieBanner + ConsentScripts.

**Home:** GROQ `heroSection` + all `caseStudy` (ordered `displayOrder`) → Hero → TrustBar (`#brands`) → CommercialPortfolio → AIPipeline → Pricing → PhotoPricing → Faq → Contact.

**About** `/about`: GROQ `aboutPage` portrait video. Heading CMS or JSON. **Lead/body are i18n** (`About.lead` — no surname). CMS `bioEn`/`bioNl` unused. **No “Selected work” heading**; work-sample **titles on cards removed**. Empty samples → placeholders without labels. CTA `/#contact`.

**Privacy:** `/privacy`, `/privacy-policy`. **404:** root EN + locale `NotFoundView`. **Studio:** `src/app/studio/[[...tool]]/page.tsx` at `/studio` (outside `[locale]`).

**API** `POST /api/contact` → Resend (`src/app/api/contact/route.ts`).

## Sanity CMS

Studio **works** at `/studio`. Client: `src/sanity/lib/client.ts`; `urlFor` `src/sanity/lib/image.ts`; re-export `src/lib/sanity.ts`. File URLs: `src/lib/sanity-media.ts` (`resolveSanityFileUrl` / `resolveSanityImageUrl`). Schemas: `heroSection`, `aboutPage`, `pricingSection`, `photoPricingSection`, `faqSection`, `siteSettings`, `caseStudy`. Structure: `src/sanity/structure.ts`. Singletons cannot be duplicated.

| Doc | Wired? | Notes |
| --- | --- | --- |
| `heroSection` | Yes | Empty copy → `Hero.*`. **No showreel → picsum.photos/1920/1080.** Trailing `.` stripped from headline. |
| `aboutPage` | Partial | Portrait video wired. Bio unused. Empty samples → demo slots (no titles). |
| `pricingSection` | Yes | Empty → JSON Starter / Growth / Partnership. |
| `photoPricingSection` | Yes | Empty → 5 / 10 photos JSON. |
| `faqSection` | Yes | Empty → JSON FAQ. Optional `<hl>` gold. |
| `siteSettings` | Yes | WhatsApp, socials, tagline, optional footer email. WhatsApp fallback `31626768814`. |
| `caseStudy` | **Yes (homepage)** | GROQ `caseVideo.asset->url` + thumbnail. `mediaType` video/photo. Homepage maps via `resolveSanityFileUrl`. **No video docs → empty AI Videos tab.** **No photo docs → Unsplash placeholders.** Live videos already play from `cdn.sanity.io`. |

Former **Custom** pack is **Partnership**.

## Contact + Resend + package handoff

- **Contact.tsx:** name, email, brand, package `<select>`, message. **No mailto.** POST translated package **label**.
- **GetInTouchModal:** name, email, project. POST `package: "Custom request"`.
- **Resend:** `RESEND_API_KEY` required. **To** `monikamalmedia@gmail.com`. **From** `Monika Mal <onboarding@resend.dev>` until domain verified (`hello@monikamalmedia.com`). `replyTo` = visitor. Subject `[Inquiry] {name} — {brand} ({time})`. HTML (RU labels): имя, email, бренд, пакет, сообщение.
- **SelectedPackageContext:** Pricing/Photo `selectPackage(id)` (`starter` \| `growth` \| `partnership` \| `photographyFive` \| `photographyTen`) → scroll `#contact`. `clearPackage` after successful Contact submit.

## Navbar / CTAs

Hashes: `#portfolio`, `#pipeline`, `#pricing`, `#faq`. About → `/about`. Right: LanguageSwitcher (frosted dropdown) + Get in touch. Mobile: compact lang + burger (`lg`). Hero **Book a project** → `#pricing`; **View work** → `#portfolio`. Nav `z-50`.

## Components (`src/components/`)

| File | Content |
| --- | --- |
| `Hero.tsx` | Full-viewport. CMS showreel or picsum. |
| `ShowreelPlayer.tsx` | Unused by Hero; kept. |
| `TrustBar.tsx` | `#brands` marquee. `/logos/celsius.png`, `clearly.svg`, `rituals.png`, `trueseamoss.png`. |
| `CommercialPortfolio.tsx` | Tabs AI Videos / AI Photos. **No section h2 / no card titles.** Sanity items. Hover: muted loop preview + Sanity thumbnail overlay. Click → modal. Custom chrome only: play/pause, mute, fullscreen (no native bar). Photos click → lightbox. Sticky groups lg 3 / md 2. Modal `z-[60]`. |
| `AIPipeline.tsx` | Brief → Concept → Production → Delivery. `#pipeline`. Scroll offset `["start 32%", "end 18%"] as ["start 32%", "end 18%"]`. |
| `Pricing.tsx` / `PricingView.tsx` | CMS or JSON. CTA Choose package / Kies pakket. Popular + glow (fallback Growth). |
| `PhotoPricing.tsx` / `PhotoPricingView.tsx` | CMS or JSON 5/10. Better value + glow (fallback 10). |
| `Faq.tsx` / `FaqView.tsx` | CMS or JSON accordion `#faq`. |
| `Contact.tsx` / `ContactFormStates.tsx` | Brief + Resend. No email on UI. |
| `GetInTouchModal.tsx` | Nav inquiry. |
| `AboutMeVideoPlayer.tsx` | Autoplay **muted**, **no loop**, one play then last frame; transparent Replay; mute toggle. |
| `Footer.tsx` / `FooterView.tsx` | CMS. Credit **Designed & Built by Savo** → `wa.me/31620329683`. |
| `Navbar.tsx` / `LanguageSwitcher.tsx` | Sticky EN/NL. Dropdown: glass `bg-white/[0.08]`, blur, staggered motion. |
| `CookieBanner.tsx` + consent | Cookie + localStorage. |
| `ConsentScripts.tsx` | GA / Meta / TikTok if IDs **and** consent. |
| `WhatsAppButton.tsx` | Fixed `z-40`. |
| `ProtectedVideo` / `ProtectedImage` / `DisableRightClick` | Casual anti-save. |
| `videoControlStyles.ts` | Shared glass Play/Pause/Mute/FS class. |
| `HomeHashScroll` / `NotFoundView` / `PrivacyContent` | Hash restore; 404; privacy. |
| `FilmGrainOverlay` / `CursorSpotlightGrid` / `ScrollRoot` | Page chrome. |

Lib: `site.ts`, `cookie-consent.ts`, `tracking.ts`, `sanity.ts`, `sanity-media.ts`, `portfolio.ts`, `cms-pricing.ts`, `cms-faq.ts`, `cms-site-settings.ts`.

### Video packages (JSON fallback)

1. **Starter** — €400. 1 commercial ≤30s, 1 avatar, **2 revisions**, 3–5 days.
2. **Growth** — €700. Popular. 2 videos + hooks, ASMR/craft, 2 revisions, 6–10 business days.
3. **Partnership** (NL **Samenwerking**) — **€1,200/month**, **€300/video**, **4 videos/month**, priority + calendar slot, 2 revisions each.

Photo: 5 / €100 and 10 / €150.

## Design rules

Blush/gold = accents. Prefer theme tokens over one-off amber except Hero neon. Stack: grain `z-[1]`, grid `z-[2]`, content `z-20+`, floats `z-40`, nav `z-50`, modals `z-[60]`+. `select-none` on media only.

## Open / next

- Keep publishing `caseStudy` (video + **thumbnail**, optional photo docs) in Studio; wiring is live.
- Real **Hero** showreel (empty → picsum). About samples still empty unless CMS `workSamples` filled. Studio bio unused — site copy is i18n.
- Buy/verify **monikamalmedia.com**; `NEXT_PUBLIC_SITE_URL`; Resend `from` → branded sender.
- Fill `siteSettings`. Analytics IDs only with consent. PostHog in `.env.local`.
- Dev: LanguageSwitcher hydration; Next 16 middleware → proxy.
