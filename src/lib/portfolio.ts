export type PortfolioType = "video" | "photo";

export function toMediaType(value: string | null | undefined): PortfolioType {
  return value === "photo" ? "photo" : "video";
}
