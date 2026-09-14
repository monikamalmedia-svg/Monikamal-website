export const SITE_NAME = "Monika Mal";

/** Public inbox for custom inquiries (mailto + form destination). */
export const INQUIRY_EMAIL = "monikamalmedia@gmail.com";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://monikamal.com";

/** E.164 without "+" or separators. Override with NEXT_PUBLIC_WHATSAPP_NUMBER. */
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") || "31626768814";

export const WHATSAPP_GREETING =
  "Hi Monika, I'm interested in AI video production for my brand";

export function whatsappHref(
  message: string = WHATSAPP_GREETING,
  number: string = WHATSAPP_NUMBER,
) {
  const digits = number.replace(/\D/g, "");
  const text = encodeURIComponent(message);
  if (digits) {
    return `https://wa.me/${digits}?text=${text}`;
  }
  return `https://wa.me/?text=${text}`;
}
