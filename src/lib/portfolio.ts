export type PortfolioType = "video" | "photo";

export type ContentType = "ugc" | "aiCommercial" | "productContent";

export type ProjectType = "client" | "concept";

/**
 * Message key (Portfolio namespace) for the independent-concept label. The content type says
 * how it was made (filmed UGC vs AI), the concept label says it wasn't commissioned.
 */
export function conceptLabelKey(contentType: ContentType): "conceptUgc" | "concept" {
  return contentType === "ugc" ? "conceptUgc" : "concept";
}

export function toMediaType(value: string | null | undefined): PortfolioType {
  return value === "photo" ? "photo" : "video";
}

/**
 * The Studio "Content category" field (required). The media-type fallback is only a safety net so an
 * incomplete document never disappears from the portfolio; every published case has a category.
 */
export function toContentType(
  value: string | null | undefined,
  mediaType: PortfolioType,
): ContentType {
  if (value === "ugc" || value === "aiCommercial" || value === "productContent") {
    return value;
  }
  return mediaType === "photo" ? "productContent" : "aiCommercial";
}

/** CMS value first; older entries only count as concepts when their category says so. Unknown stays unlabelled. */
export function toProjectType(
  value: string | null | undefined,
  category: string | null | undefined,
): ProjectType | null {
  if (value === "client" || value === "concept") return value;
  return category && /concept/i.test(category) ? "concept" : null;
}

/** URL-safe slug for portfolio deep links (`/projects/[slug]`). */
export function slugifyProject(value: string): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "project";
}

/** Assign unique slugs when titles collide (e.g. same brand, different years). */
export function uniqueProjectSlugs(titles: string[]): string[] {
  const seen = new Map<string, number>();

  return titles.map((title) => {
    const base = slugifyProject(title);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  });
}
