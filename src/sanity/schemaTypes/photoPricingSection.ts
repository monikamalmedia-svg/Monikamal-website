import { defineArrayMember, defineField, defineType } from "sanity";

export const photoPricingSection = defineType({
  name: "photoPricingSection",
  title: "Pricing (photo packages)",
  type: "document",
  fields: [
    defineField({
      name: "headingEn",
      title: "Heading (English)",
      type: "string",
    }),
    defineField({
      name: "headingNl",
      title: "Heading (Dutch)",
      type: "string",
    }),
    defineField({
      name: "photoPackages",
      title: "Photo packages",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "photoPackage",
          title: "Photo package",
          fields: [
            defineField({
              name: "nameEn",
              title: "Name (English)",
              type: "string",
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
              description: 'e.g. "€100"',
            }),
            defineField({
              name: "pricePerUnit",
              title: "Price per unit",
              type: "string",
              description: 'e.g. "€20 / photo"',
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
              name: "isBetterValue",
              title: "Better value badge",
              type: "boolean",
              description: 'Show the "Better value" badge on this package.',
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
        title: title || "Pricing (photo packages)",
      };
    },
  },
});
