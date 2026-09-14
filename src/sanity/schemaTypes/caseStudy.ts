import { defineField, defineType } from "sanity";

export const caseStudy = defineType({
  name: "caseStudy",
  title: "Case Study",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Brand name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      description: 'Industry label under the card, e.g. "E-commerce / Beauty".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "mediaType",
      title: "Media Type",
      type: "string",
      options: {
        list: [
          { title: "AI Videos", value: "video" },
          { title: "AI Photos", value: "photo" },
        ],
        layout: "radio",
      },
      initialValue: "video",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "number",
      validation: (rule) => rule.required().integer().min(2000).max(2100),
    }),
    defineField({
      name: "caseVideo",
      title: "Case video",
      type: "file",
      options: {
        accept: "video/mp4,video/webm,video/quicktime",
      },
    }),
    defineField({
      name: "thumbnail",
      title: "Thumbnail",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "displayOrder",
      title: "Display order",
      type: "number",
      description: "Lower numbers appear first on the site.",
      initialValue: 0,
    }),
    defineField({
      name: "featured",
      title: "Featured on homepage",
      type: "boolean",
      description: "Show this case in the homepage Portfolio grid.",
      initialValue: true,
    }),
  ],
  orderings: [
    {
      title: "Display order",
      name: "orderAsc",
      by: [{ field: "displayOrder", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      category: "category",
      mediaType: "mediaType",
      year: "year",
      media: "thumbnail",
    },
    prepare({ title, category, mediaType, year, media }) {
      return {
        title: title || "Untitled case",
        subtitle: [mediaType, category, year].filter(Boolean).join(" · "),
        media,
      };
    },
  },
});
