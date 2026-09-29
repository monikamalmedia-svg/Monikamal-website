import { defineArrayMember, defineField, defineType } from "sanity";

/** Keep in sync with CASE_READY in src/lib/cases.ts. */
const REQUIRED_FOR_CASE_PAGE = [
  "summaryNl",
  "summaryEn",
  "conceptNl",
  "conceptEn",
  "approachNl",
  "approachEn",
] as const;

const PLATFORM_OPTIONS = [
  { title: "Instagram / Reels", value: "instagram" },
  { title: "TikTok", value: "tiktok" },
  { title: "Meta Ads", value: "metaAds" },
  { title: "YouTube / Shorts", value: "youtube" },
  { title: "Webshop / product page", value: "webshop" },
  { title: "Organic social", value: "organic" },
];

const MEDIA_TYPE_OPTIONS = [
  { title: "Video", value: "video" },
  { title: "Photo", value: "photo" },
];

/** Portfolio taxonomy. Keep values in sync with ContentType in src/lib/portfolio.ts. UGC + AI is a form option, not a category. */
const CONTENT_CATEGORY_OPTIONS = [
  { title: "UGC", value: "ugc" },
  { title: "AI Commercials", value: "aiCommercial" },
  { title: "Product Content", value: "productContent" },
];

const PROJECT_TYPE_OPTIONS = [
  { title: "Client work", value: "client" },
  { title: "Independent concept", value: "concept" },
];

const optionTitle = (options: { title: string; value: string }[], value?: string) =>
  options.find((option) => option.value === value)?.title;

const caseText =(name: string, title: string, description?: string) =>
  defineField({ name, title, type: "text", rows: 4, group: "case", description });

export const caseStudy = defineType({
  name: "caseStudy",
  title: "Case Study",
  type: "document",
  groups: [{ name: "case", title: "Case page" }],
  fields: [
    defineField({
      name: "title",
      title: "Brand name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Case page slug",
      type: "slug",
      group: "case",
      options: { source: "title", maxLength: 80 },
      description: "URL part, e.g. nira-breeze. Must be unique.",
    }),
    defineField({
      name: "mediaType",
      title: "Media type",
      type: "string",
      description: "What the portfolio card shows: a video or a photo.",
      options: {
        list: MEDIA_TYPE_OPTIONS,
        layout: "radio",
      },
      initialValue: "video",
      validation: (rule) => rule.required(),
    }),
    defineField({
      // Stored as "contentType" (existing data and GROQ); shown to the owner as "Content category".
      name: "contentType",
      title: "Content category",
      type: "string",
      description:
        "Choose where this project should appear across the website. " +
        "UGC — hand-shot creator or product content. " +
        "AI Commercials — AI-led commercial or video production. " +
        "Product Content — product photography, visuals or product-focused content. " +
        "Hybrid work: pick its main commercial category.",
      options: {
        list: CONTENT_CATEGORY_OPTIONS,
        layout: "radio",
      },
      validation: (rule) => rule.required().error("Choose a content category: UGC, AI Commercials or Product Content."),
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "number",
      validation: (rule) => rule.required().integer().min(2000).max(2100),
    }),
    defineField({
      name: "projectType",
      title: "Project type",
      type: "string",
      description:
        'Independent concepts are labelled as concepts on the site (e.g. "Independent AI concept"), so a featured brand is never presented as a client.',
      options: {
        list: PROJECT_TYPE_OPTIONS,
        layout: "radio",
      },
    }),
    defineField({
      name: "caseVideo",
      title: "Case video",
      type: "file",
      options: {
        accept: "video/mp4,video/webm,video/quicktime",
      },
    }),
    defineField({
      name: "thumbnail",
      title: "Thumbnail",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "format",
      title: "Format / platform",
      type: "string",
      description: 'Optional, e.g. "9:16 · Paid Social" or "Instagram · TikTok".',
    }),
    defineField({
      name: "category",
      title: "Industry",
      type: "string",
      description:
        'Optional. Choose the industry that best fits this project. Content category and Project type are set above.',
    }),
    defineField({
      name: "featured",
      title: "Featured on homepage",
      type: "boolean",
      description: "Show this case in the homepage Portfolio grid.",
      initialValue: true,
    }),
    defineField({
      name: "featuredOrder",
      title: "Order in “Alles”",
      type: "number",
      description:
        "Position in the mixed “Alles / All” portfolio view (1 = first). Mix content types so no single type dominates the first row. Empty = after the numbered items. Category filters keep “Display order”.",
    }),
    defineField({
      name: "displayOrder",
      title: "Display order",
      type: "number",
      description: "Lower numbers appear first on the site.",
      initialValue: 0,
    }),
    defineField({
      name: "publishCasePage",
      title: "Publish case page",
      type: "boolean",
      group: "case",
      initialValue: false,
      description:
        "Creates /nl/portfolio/<slug> and /en/portfolio/<slug>. Only turn on when summary, concept and approach are written in both languages — pages without real content are not published.",
      validation: (rule) =>
        rule.custom((value, context) => {
          if (!value) return true;
          const doc = (context.document ?? {}) as Record<string, unknown>;
          const slug = (doc.slug as { current?: string } | undefined)?.current;
          const missing: string[] = REQUIRED_FOR_CASE_PAGE.filter(
            (field) => !String(doc[field] ?? "").trim(),
          );
          if (!slug) missing.unshift("slug");
          return missing.length === 0
            ? true
            : `Fill in before publishing the case page: ${missing.join(", ")}`;
        }),
    }),
    defineField({
      name: "caseTitleNl",
      title: "Page title / H1 (Dutch)",
      type: "string",
      group: "case",
      description:
        'Optional descriptive H1, e.g. "AI-commercial voor Nira Breeze". Defaults to "<brand> — <content type>". Needed when two cases share a brand name.',
    }),
    defineField({
      name: "caseTitleEn",
      title: "Page title / H1 (English)",
      type: "string",
      group: "case",
    }),
    defineField({ name: "eyebrowNl", title: "Eyebrow (Dutch)", type: "string", group: "case", description: 'Optional label above the H1, e.g. "UGC-productvideo". Defaults to the content type.' }),
    defineField({ name: "eyebrowEn", title: "Eyebrow (English)", type: "string", group: "case" }),
    defineField({ name: "industryNl", title: "Industry (Dutch)", type: "string", group: "case", description: 'e.g. "Wonen" or "Huidverzorging".' }),
    defineField({ name: "industryEn", title: "Industry (English)", type: "string", group: "case", description: 'e.g. "Home" or "Skincare".' }),
    defineField({
      name: "platforms",
      title: "Platforms",
      type: "array",
      group: "case",
      of: [defineArrayMember({ type: "string" })],
      options: { list: PLATFORM_OPTIONS, layout: "grid" },
    }),
    caseText("summaryNl", "Summary (Dutch)", "1–2 sentences. Intro on the page and the Google description (about 150 characters)."),
    caseText("summaryEn", "Summary (English)"),
    caseText("conceptNl", "Creative concept (Dutch)", "The idea behind the video/visuals."),
    caseText("conceptEn", "Creative concept (English)"),
    caseText("objectiveNl", "Objective (Dutch)", "Optional. What the content had to do. No performance numbers unless they are real client data."),
    caseText("objectiveEn", "Objective (English)"),
    caseText("visualNl", "Visual approach (Dutch)", "Optional. Light, camera, colour, composition, movement — only what is visible in the work."),
    caseText("visualEn", "Visual approach (English)"),
    caseText("approachNl", "Production approach (Dutch)", "How it was made: UGC, AI, hybrid, editing, sound."),
    caseText("approachEn", "Production approach (English)"),
    defineField({
      name: "deliverablesNl",
      title: "Deliverables (Dutch)",
      type: "array",
      group: "case",
      of: [defineArrayMember({ type: "string" })],
      description: 'Optional, e.g. "1 video 9:16 (15 sec)".',
    }),
    defineField({
      name: "deliverablesEn",
      title: "Deliverables (English)",
      type: "array",
      group: "case",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({ name: "seoTitleNl", title: "SEO title (Dutch)", type: "string", group: "case", description: 'Browser/Google title incl. "| Monika Mal". Defaults to "<H1> | Monika Mal".' }),
    defineField({ name: "seoTitleEn", title: "SEO title (English)", type: "string", group: "case" }),
    defineField({ name: "seoDescriptionNl", title: "Meta description (Dutch)", type: "text", rows: 2, group: "case", description: "About 150 characters. Defaults to the summary." }),
    defineField({ name: "seoDescriptionEn", title: "Meta description (English)", type: "text", rows: 2, group: "case" }),
  ],
  orderings: [
    {
      title: "Order in “Alles”",
      name: "featuredOrderAsc",
      by: [{ field: "featuredOrder", direction: "asc" }],
    },
    {
      title: "Display order",
      name: "orderAsc",
      by: [{ field: "displayOrder", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      contentType: "contentType",
      projectType: "projectType",
      mediaType: "mediaType",
      year: "year",
      media: "thumbnail",
    },
    prepare({ title, contentType, projectType, mediaType, year, media }) {
      return {
        title: title || "Untitled case",
        // e.g. "video · AI Commercials · Concept · 2026"
        subtitle: [
          mediaType,
          optionTitle(CONTENT_CATEGORY_OPTIONS, contentType) ?? "⚠ no category",
          projectType === "client" ? "Client" : projectType === "concept" ? "Concept" : null,
          year,
        ]
          .filter(Boolean)
          .join(" · "),
        media,
      };
    },
  },
});
