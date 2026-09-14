function publicId(value: string | undefined) {
  const id = value?.trim() ?? "";
  return /^[A-Z0-9-]+$/i.test(id) ? id : "";
}

/** Set in .env.local only after the tool is actually connected. */
export const GA_MEASUREMENT_ID = publicId(
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
);
export const META_PIXEL_ID = publicId(process.env.NEXT_PUBLIC_META_PIXEL_ID);
export const TIKTOK_PIXEL_ID = publicId(process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID);
