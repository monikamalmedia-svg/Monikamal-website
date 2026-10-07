export const SITE_NAME = "Monika Mal";

/** Public inbox for custom inquiries (mailto + form destination). */
export const INQUIRY_EMAIL = "monikamalmedia@gmail.com";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://monikamal.com";

/** E.164 without "+" or separators. Override with NEXT_PUBLIC_WHATSAPP_NUMBER. */
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") || "31626768814";

