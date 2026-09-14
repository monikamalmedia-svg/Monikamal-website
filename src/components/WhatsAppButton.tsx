import { getTranslations } from "next-intl/server";
import { fetchSiteSettings } from "@/lib/cms-site-settings";
import { whatsappHref } from "@/lib/site";

function WhatsAppIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={props.className}>
      <path d="M12.04 2.5A9.5 9.5 0 0 0 3.2 16.3L2.5 21.5l5.3-.7A9.5 9.5 0 1 0 12.04 2.5Zm0 17.4a7.9 7.9 0 0 1-4.02-1.1l-.29-.17-3.15.42.43-3.07-.18-.3a7.9 7.9 0 1 1 7.21 4.22Zm4.33-5.92c-.24-.12-1.4-.69-1.62-.77s-.37-.12-.53.12-.61.77-.75.93-.28.18-.52.06a6.5 6.5 0 0 1-1.9-1.17 7.1 7.1 0 0 1-1.3-1.62c-.14-.24 0-.37.1-.49s.24-.28.35-.43.12-.24.18-.4.03-.3-.01-.43-.53-1.27-.72-1.74c-.19-.46-.38-.4-.53-.4h-.45c-.16 0-.4.06-.62.3s-.81.79-.81 1.93.83 2.24.95 2.4c.12.16 1.63 2.49 3.95 3.49 1.47.63 1.85.69 2.51.58.38-.06 1.4-.57 1.6-1.12s.2-1.02.14-1.12-.22-.18-.46-.3Z" />
    </svg>
  );
}

export async function WhatsAppButton() {
  const t = await getTranslations("WhatsApp");
  const settings = await fetchSiteSettings();

  return (
    <a
      href={whatsappHref(t("greeting"), settings.whatsappNumber)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("label")}
      className="fixed right-5 bottom-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-glass-border bg-graphite/90 text-[#E8A5B8] opacity-90 shadow-burgundy-glow backdrop-blur-md transition-all duration-300 hover:border-gold hover:text-gold hover:opacity-100 md:right-6 md:bottom-6"
    >
      <WhatsAppIcon className="h-5 w-5" />
    </a>
  );
}
