import { defineField, defineType } from "sanity";

export const heroSection = defineType({
  name: "heroSection",
  title: "Hero section",
  type: "document",
  fields: [
    defineField({
      name: "kickerEn",
      title: "Kicker (English)",
      type: "string",
      description: 'Small line above the headline, e.g. "AI-Driven Video Production"',
    }),
    defineField({
      name: "kickerNl",
      title: "Kicker (Dutch)",
      type: "string",
    }),
    defineField({
      name: "headlineEn",
      title: "Headline (English)",
      type: "string",
      description: 'Main heading, e.g. "AI Commercials"',
    }),
    defineField({
      name: "headlineNl",
      title: "Headline (Dutch)",
      type: "string",
    }),
    defineField({
      name: "subheadlineEn",
      title: "Subheadline (English)",
      type: "text",
      rows: 3,
      description:
        'e.g. "Cinematic visual assets built for high-converting e-commerce brands."',
    }),
    defineField({
      name: "subheadlineNl",
      title: "Subheadline (Dutch)",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "showreelVideo",
      title: "Showreel video",
      type: "file",
      options: {
        accept: "video/*",
      },
    }),
  ],
  preview: {
    select: {
      title: "headlineEn",
    },
    prepare({ title }) {
      return {
        title: title || "Hero section",
      };
    },
  },
});
