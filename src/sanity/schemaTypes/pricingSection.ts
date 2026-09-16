import { defineArrayMember, defineField, defineType } from "sanity";

export const pricingSection = defineType({
  name: "pricingSection",
  title: "Pricing (video packages)",
  type: "document",
  fields: [
    defineField({
      name: "headingEn",
      title: "Heading (English)",
      type: "string",
      description: 'Section title, e.g. "Prices & Packages"',
    }),
    defineField({
      name: "headingNl",
      title: "Heading (Dutch)",
      type: "string",
      description: 'e.g. "Prijs & Pakketten"',
    }),
    defineField({
      name: "videoPackages",
      title: "Video packages",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "videoPackage",
          title: "Video package",
          fields: [
            defineField({
              name: "nameEn",
              title: "Name (English)",
              type: "string",
              description: "Starter / Growth / Partnership",
            }),
            defineField({
              name: "nameNl",
              title: "Name (Dutch)",
              type: "string",
            }),
            defineField({
              name: "price",
              title: "Price",
              type: "string",
              description: 'e.g. "€400" or "€1,200/month"',
            }),
            defineField({
              name: "pricePerUnit",
              title: "Price per unit",
              type: "string",
              description: 'Optional caption under the price, e.g. "€300/video"',
            }),
            defineField({
              name: "featuresEn",
              title: "Features (English)",
              type: "array",
              of: [{ type: "string" }],
            }),
            defineField({
              name: "featuresNl",
              title: "Features (Dutch)",
              type: "array",
              of: [{ type: "string" }],
            }),
            defineField({
              name: "isPopular",
              title: "Popular badge",
              type: "boolean",
              description: 'Show the "Popular" badge on this package.',
              initialValue: false,
            }),
            defineField({
              name: "order",
              title: "Display order",
              type: "number",
              description: "Lower numbers appear first.",
              initialValue: 0,
            }),
          ],
          preview: {
            select: {
              title: "nameEn",
              subtitle: "price",
              order: "order",
            },
            prepare({ title, subtitle, order }) {
              return {
                title: title || "Untitled package",
                subtitle: [subtitle, order != null ? `order ${order}` : null]
                  .filter(Boolean)
                  .join(" · "),
              };
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "headingEn",
    },
    prepare({ title }) {
      return {
        title: title || "Pricing (video packages)",
      };
    },
  },
});
