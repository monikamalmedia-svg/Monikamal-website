export type PortfolioType = "video" | "photo";

export function toMediaType(value: string | null | undefined): PortfolioType {
  return value === "photo" ? "photo" : "video";
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
