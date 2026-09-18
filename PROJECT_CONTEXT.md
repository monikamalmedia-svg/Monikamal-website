# PROJECT_CONTEXT — Monika Mal Media

Cinematic AI commercials for e-commerce. Locales **en** (unprefixed) / **nl** (`/nl`). Copy: `src/messages/en.json`, `src/messages/nl.json`. **Domain `monikamalmedia.com` is not purchased.** `SITE_URL` fallback: `https://monikamal.com` (`src/lib/site.ts`). Inbox: **`monikamalmedia@gmail.com`**. Brand files: `/logo.png`, `/favicon.ico`, `/favicon-32x32.png`, `/favicon-16x16.png`, `/apple-touch-icon.png`, `/site.webmanifest`, `/og-image.jpg`. Icons are wired in `src/app/[locale]/layout.tsx` (root `layout.tsx` metadata is title/description/keywords/OG only — no icons there).

**No studio email on Contact / Get in touch.** Form POST → Resend. Footer mailto only if CMS `siteSettings.contactEmail` is set. Privacy uses gmail. `INQUIRY_EMAIL` in `src/lib/site.ts` is not rendered on Contact.

## Stack

Next.js **16** App Router (`src/app`), React 19, TS, Tailwind **v4**, Framer Motion, Lucide, next-intl, Sanity (`next-sanity` + Studio `/studio`), Resend, PostHog (`src/app/providers.tsx`). Flags: `country-flag-icons`. `next.config.ts`: `createNextIntlPlugin("./src/i18n/request.ts")`; headers `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`. Next 16 may warn `middleware.ts` → `proxy.ts` (not migrated).

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

Fonts: **Manrope** → `--font-sans`, **Cormorant Garamond** → `--font-display` / `--font-serif`. `@utility font-display`. Shadows: `--shadow-gold-glow`; `.shadow-gold-glow`, `.shadow-burgundy-glow`. Extra: `.glow-border-card`, `.trust-marquee`, `.film-grain-overlay`. Tailwind arbitrary `rgba()` shadows need **underscores**.

## i18n (next-intl)

- `src/i18n/routing.ts` — `en` / `nl`, default `en`, locale cookie
- `src/i18n/request.ts` — `src/messages/{locale}.json`
- `src/i18n/navigation.ts` — locale-aware `Link` / router
- `src/middleware.ts` — matcher excludes `api`, `trpc`, `_next`, `_vercel`, `studio`, `opengraph-image`, `twitter-image`, `icon`, `.*\\..*`

UI: `useTranslations()` / `getTranslations()`. Namespace **Faq** (not `faq`).

## App structure

**Root** `src/app/layout.tsx`: fonts, `globals.css`, PostHog. `lang` from `getLocale()` (fallback `en` for `/studio`). Metadata object (exact): title/description/keywords/OG for global AI video / US & Europe. Unused leftovers: `DEFAULT_TITLE`, `DEFAULT_DESCRIPTION`. Per-locale `generateMetadata` in `[locale]/layout.tsx` still uses `Metadata.*` from JSON + hreflang.

**Locale** `src/app/[locale]/layout.tsx`: `NextIntlClientProvider` → `SelectedPackageProvider` → `CookieConsentProvider` → `DisableRightClick` → `ScrollRoot` → grain + cursor grid → `Navbar` → page → `Footer` + CookieBanner + ConsentScripts. **No floating WhatsApp button** (component deleted).

**Home:** GROQ `heroSection` + all `caseStudy` (ordered `displayOrder`) → Hero → TrustBar (`#brands`) → CommercialPortfolio → AIPipeline → Pricing → PhotoPricing → Faq → Contact.

**About** `/about`: GROQ `aboutPage` portrait video. Heading CMS or JSON. **Lead/body are i18n** (`About.lead` — no surname). CMS `bioEn`/`bioNl` unused. **No “Selected work” heading**; work-sample titles on cards removed. Empty samples → placeholders without labels (demo stubs). CTA `/#contact`. About player: auto-hide controls (hover / tap 2.4s); **mobile fullscreen** via `allowFullscreen` + Maximize2 (`About.fullscreen`). Portfolio player stays `nofullscreen`.

**Privacy:** `/privacy`, `/privacy-policy`. **404:** root EN + locale `NotFoundView`. **Studio:** `src/app/studio/[[...tool]]/page.tsx` at `/studio` (outside `[locale]`).

**API** `POST /api/contact` → Resend (`src/app/api/contact/route.ts`).

## Sanity CMS

Studio **works** at `/studio`. Client: `src/sanity/lib/client.ts`; `urlFor` `src/sanity/lib/image.ts`; re-export `src/lib/sanity.ts`. File URLs: `src/lib/sanity-media.ts`. Schemas: `heroSection`, `aboutPage`, `pricingSection`, `photoPricingSection`, `faqSection`, `siteSettings`, `caseStudy`. Structure: `src/sanity/structure.ts`. Singletons cannot be duplicated.

| Doc | Wired? | Notes |
| --- | --- | --- |
| `heroSection` | Yes | Empty copy → `Hero.*`. **No showreel → picsum.photos/1920/1080.** Trailing `.` stripped from headline. Subtitle always i18n (`Hero.subtitle`). |
| `aboutPage` | Partial | Portrait video wired. Bio unused. Empty `workSamples` → unlabeled demo slots. |
| `pricingSection` | Yes | Empty → JSON Starter / Growth / Partnership. |
| `photoPricingSection` | Yes | Empty → 5 / 10 photos JSON. |
| `faqSection` | Yes | Empty → JSON FAQ. Optional `<hl>` gold. |
| `siteSettings` | Yes | WhatsApp, socials, tagline, optional footer email. WhatsApp fallback `31626768814`. |
| `caseStudy` | **Yes (homepage GROQ)** | `caseVideo.asset->url` + thumbnail + `category` / `year`. Homepage maps via `resolveSanityFileUrl`. **No video docs → empty AI Videos tab.** **No photo docs → Unsplash placeholders.** Live videos play from `cdn.sanity.io` when published. Next real-work step is filling Studio, not new wiring. |

Former **Custom** pack is **Partnership**.

## Contact + Resend + package handoff

- **Contact.tsx:** name, email, brand, package `<select>`, message. **No mailto / no displayed studio email.** POST translated package **label**.
- **GetInTouchModal:** name, email, project. POST `package: "Custom request"`.
- **Resend:** `RESEND_API_KEY` required. **To** `monikamalmedia@gmail.com`. **From** `Monika Mal <onboarding@resend.dev>` until domain verified (`hello@monikamalmedia.com`). `replyTo` = visitor. Subject `[Inquiry] {name} — {brand} ({time})`. HTML (RU labels): имя, email, бренд, пакет, сообщение. Honeypot `website_url`.
- **SelectedPackageContext:** Pricing/Photo `selectPackage(label)` → scroll `#contact`. Contact pre-selects that option. `clearPackage` after successful submit.

## Navbar / CTAs

Hashes: `#portfolio`, `#pipeline`, `#pricing`, `#faq`. About → `/about`. Right (`lg+`): LanguageSwitcher (frosted dropdown) + **Let’s Talk** / **Aanvraag** (`Navbar.contactCta`, ghost `border-glass-border` + `bg-black/30`, opens Get in touch modal). Mobile (`<lg`): same CTA (scroll `#contact`) + ghost burger. Overlay: section links + LanguageSwitcher only (no Get in touch). Overlay `lg:hidden`. Hero **Book a project** → `#pricing`; **View work** → `#portfolio`. Nav `z-50`.

## Components (`src/components/`)

| File | Content |
| --- | --- |
| `Hero.tsx` | Full-viewport. CMS showreel or picsum. Copy fades on scroll 0–300px (`copyOpacity` / `copyY`). Watermark `text-white/70 uppercase`: `bottom-14 md:bottom-6 right-0` (mobile near Scroll, desktop unchanged). |
| `ShowreelPlayer.tsx` | Unused by Hero; kept. |
| `TrustBar.tsx` | `#brands` marquee. `/logos/celsius.png`, `clearly.svg`, `rituals.png`, `trueseamoss.png`. |
| `CommercialPortfolio.tsx` | Tabs AI Videos / AI Photos. **Static 3-col grid (no sticky/parallax).** No section h2. Captions: category `text-gray-300`; title `text-white` as `{title} · {year}`; **centered**. Media `w-[85vw] max-w-[340px]` mobile, `sm:h-[500px] lg:h-[550px]`. Hover: muted loop + thumbnail overlay. Click → modal (`z-[60]`) with custom chrome (play/pause/mute/FS). Photos → lightbox. |
| `AIPipeline.tsx` | Brief → Concept → Production → Delivery. `#pipeline`. Offset `STEP_SCROLL_OFFSET: [string, string] = ["start 48%", "end 28%"]` + `// @ts-ignore` on `useScroll`. |
| `Pricing.tsx` / `PricingView.tsx` | CMS or JSON. CTA Choose package / Kies pakket. Popular + glow (fallback Growth). |
| `PhotoPricing.tsx` / `PhotoPricingView.tsx` | CMS or JSON 5/10. Better value + glow (fallback 10). `pt-8 pb-12 md:pb-16` (tight gap to FAQ). |
| `Faq.tsx` / `FaqView.tsx` | CMS or JSON accordion `#faq`. `py-12 md:py-16`. |
| `Contact.tsx` / `ContactFormStates.tsx` | Brief + Resend. No email on UI. |
| `GetInTouchModal.tsx` | Nav inquiry. |
| `AboutMeVideoPlayer.tsx` / `AboutWorkGrid.tsx` | Autoplay muted, no loop, last-frame freeze; Replay + mute; auto-hide chrome; mobile FS. |
| `Footer.tsx` / `FooterView.tsx` | CMS. WhatsApp in footer. Legal bar **after** full-width border: copyright + Privacy/Cookies, `flex-col items-center text-center`. No Savo credit. |
| `Navbar.tsx` / `LanguageSwitcher.tsx` | Sticky EN/NL. Desktop: lang + Let’s Talk/Aanvraag (modal). Mobile header: same CTA + burger; overlay: section links + lang only. Dropdown: glass `bg-white/[0.08]`, blur, staggered motion. |
| `CookieBanner.tsx` + consent | Cookie + localStorage. |
| `ConsentScripts.tsx` | GA / Meta / TikTok if IDs **and** consent. |
| `ProtectedVideo` / `ProtectedImage` / `DisableRightClick` | Casual anti-save. `allowFullscreen` toggles `nofullscreen` in `controlsList`. |
| `useAutoHideVideoControls.ts` | Hover show; tap reveal then hide 2400ms; `enterVideoFullscreen` (iOS `webkitEnterFullscreen`). |
| `videoControlStyles.ts` | Shared glass Play/Pause/Mute/FS class. |
| `HomeHashScroll` / `NotFoundView` / `PrivacyContent` | Hash restore; 404; privacy. |
| `FilmGrainOverlay` / `CursorSpotlightGrid` / `ScrollRoot` | Page chrome. |

Lib: `site.ts`, `cookie-consent.ts`, `tracking.ts`, `sanity.ts`, `sanity-media.ts`, `portfolio.ts`, `cms-pricing.ts`, `cms-faq.ts`, `cms-site-settings.ts`. Context: `SelectedPackageContext`, `CookieConsentContext`.

### Video packages (JSON fallback)

1. **Starter** — **€400**. 1 commercial ≤30s, 1 avatar, **2 revisions**, 3–5 days.
2. **Growth** — **€700**. Popular. 2 videos + hooks, ASMR/craft, 2 revisions, 6–10 business days.
3. **Partnership** (NL **Samenwerking**) — **€1,200/month**, **€300/video**, **4 videos/month**, priority + calendar slot, 2 revisions each.

Photo: 5 / €100 and 10 / €150.

## Design rules

Blush/gold = accents. Prefer theme tokens over one-off amber except Hero neon. Stack: grain `z-[1]`, grid `z-[2]`, content `z-20+`, floats `z-40`, nav `z-50`, modals `z-[60]`+. `select-none` on media only.

## Open / next

- Publish real `caseStudy` docs (video + thumbnail, optional photos) in Studio; homepage wiring is live.
- Real **Hero** showreel (empty → picsum). About copy/samples still demo unless CMS `workSamples` filled. Studio bio unused — site copy is i18n.
- Buy/verify **monikamalmedia.com**; `NEXT_PUBLIC_SITE_URL`; Resend `from` → branded sender.
- Fill `siteSettings`. Analytics IDs only with consent. PostHog in `.env.local`.
- Dev: LanguageSwitcher hydration; Next 16 middleware → proxy; leftover `DEFAULT_*` in root layout.
