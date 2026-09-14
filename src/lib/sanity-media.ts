import { urlFor } from "@/sanity/lib/image";
import { dataset, projectId } from "@/sanity/env";
import type { SanityImageSource } from "@sanity/image-url";

type AssetLike = {
  url?: string | null;
  asset?: AssetLike | null;
  _ref?: string | null;
  _id?: string | null;
};

function fileRefToCdnUrl(ref: string): string | null {
  if (!ref.startsWith("file-")) return null;
  const withoutPrefix = ref.slice("file-".length);
  const lastDash = withoutPrefix.lastIndexOf("-");
  if (lastDash <= 0) return null;
  const id = withoutPrefix.slice(0, lastDash);
  const ext = withoutPrefix.slice(lastDash + 1);
  if (!id || !ext) return null;
  return `https://cdn.sanity.io/files/${projectId}/${dataset}/${id}.${ext}`;
}

function asAbsoluteUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
    return trimmed;
  }
  if (trimmed.startsWith("cdn.sanity.io/")) {
    return `https://${trimmed}`;
  }
  return null;
}

export function resolveSanityFileUrl(value: unknown): string | null {
  if (!value) return null;

  if (typeof value === "string") {
    return asAbsoluteUrl(value) ?? fileRefToCdnUrl(value);
  }

  if (typeof value !== "object") return null;
  const obj = value as AssetLike;
  if (typeof obj.url === "string") {
    return resolveSanityFileUrl(obj.url);
  }
  if (typeof obj._ref === "string") {
    return fileRefToCdnUrl(obj._ref) ?? asAbsoluteUrl(obj._ref);
  }
  if (typeof obj._id === "string") {
    return fileRefToCdnUrl(obj._id) ?? asAbsoluteUrl(obj._id);
  }
  if (obj.asset) {
    return resolveSanityFileUrl(obj.asset);
  }
  return null;
}

export function resolveSanityImageUrl(value: unknown): string | null {
  const fromFile = resolveSanityFileUrl(value);
  if (fromFile) return fromFile;
  if (!value) return null;
  try {
    const url = urlFor(value as SanityImageSource).width(1400).auto("format").url();
    return url || null;
  } catch {
    return null;
  }
}

export function isPlayableVideoUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
