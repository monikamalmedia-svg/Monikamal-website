import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({
      name: "whatsappNumber",
      title: "WhatsApp number",
      type: "string",
      description: "Used by the footer WhatsApp link. Digits with or without +.",
    }),
    defineField({
      name: "contactEmail",
      title: "Contact email",
      type: "string",
      description: "Shown in the footer when filled.",
    }),
    defineField({
      name: "instagramUrl",
      title: "Instagram URL",
      type: "string",
    }),
    defineField({
      name: "tiktokUrl",
      title: "TikTok URL",
      type: "string",
    }),
    defineField({
      name: "linkedinUrl",
      title: "LinkedIn URL",
      type: "string",
    }),
    defineField({
      name: "footerTaglineEn",
      title: "Footer tagline (English)",
      type: "string",
      description: "Line under the logo in the footer.",
    }),
    defineField({
      name: "footerTaglineNl",
      title: "Footer tagline (Dutch)",
      type: "string",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Site settings" };
    },
  },
});
