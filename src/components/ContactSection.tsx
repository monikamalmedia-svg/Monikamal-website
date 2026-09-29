import { Contact, type ContentTypeId } from "@/components/Contact";
import { fetchSiteSettings } from "@/lib/cms-site-settings";

/** Server wrapper so the demo form's success state can link to Monika's Instagram. */
export async function ContactSection({
  defaultContentType,
}: {
  defaultContentType?: ContentTypeId;
}) {
  const settings = await fetchSiteSettings();
  return (
    <Contact
      instagramUrl={settings.instagramUrl}
      tiktokUrl={settings.tiktokUrl}
      defaultContentType={defaultContentType}
    />
  );
}
