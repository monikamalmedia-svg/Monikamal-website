import { defineArrayMember, defineField, defineType } from "sanity";

export const faqSection = defineType({
  name: "faqSection",
  title: "FAQ",
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
      name: "subheadingEn",
      title: "Subheading (English)",
      type: "string",
    }),
    defineField({
      name: "subheadingNl",
      title: "Subheading (Dutch)",
      type: "string",
    }),
    defineField({
      name: "questions",
      title: "Questions",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "faqItem",
          title: "FAQ item",
          fields: [
            defineField({
              name: "questionEn",
              title: "Question (English)",
              type: "string",
            }),
            defineField({
              name: "questionNl",
              title: "Question (Dutch)",
              type: "string",
            }),
            defineField({
              name: "answerEn",
              title: "Answer (English)",
              type: "text",
              rows: 4,
              description: "Optional <hl>text</hl> wraps gold highlights.",
            }),
            defineField({
              name: "answerNl",
              title: "Answer (Dutch)",
              type: "text",
              rows: 4,
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
              title: "questionEn",
              order: "order",
            },
            prepare({ title, order }) {
              return {
                title: title || "Untitled question",
                subtitle: order != null ? `order ${order}` : undefined,
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
        title: title || "FAQ",
      };
    },
  },
});
