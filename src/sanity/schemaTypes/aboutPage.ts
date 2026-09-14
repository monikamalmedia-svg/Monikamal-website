import { defineArrayMember, defineField, defineType } from "sanity";

export const aboutPage = defineType({
  name: "aboutPage",
  title: "About me",
  type: "document",
  fields: [
    defineField({
      name: "video",
      title: "Video / Portrait Video",
      type: "file",
      description: "Portrait video of Monika for the About page.",
      options: {
        accept: "video/mp4,video/webm,video/quicktime",
      },
    }),
    defineField({
      name: "headingEn",
      title: "Heading (English)",
      type: "string",
      description: 'For example: "About me"',
    }),
    defineField({
      name: "headingNl",
      title: "Heading (Dutch)",
      type: "string",
      description: 'For example: "Over mij"',
    }),
    defineField({
      name: "bioEn",
      title: "Biography (English)",
      type: "text",
      rows: 8,
    }),
    defineField({
      name: "bioNl",
      title: "Biography (Dutch)",
      type: "text",
      rows: 8,
    }),
    defineField({
      name: "workSamples",
      title: "My work",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "workSample",
          title: "Work sample",
          fields: [
            defineField({
              name: "video",
              title: "Work Video",
              type: "file",
              options: {
                accept: "video/mp4,video/webm,video/quicktime",
              },
            }),
            defineField({
              name: "image",
              title: "Image / Thumbnail",
              type: "image",
              description: "Fallback preview if no video is uploaded.",
              options: {
                hotspot: true,
              },
            }),
            defineField({
              name: "titleEn",
              title: "Title (English)",
              type: "string",
            }),
            defineField({
              name: "titleNl",
              title: "Title (Dutch)",
              type: "string",
            }),
          ],
          preview: {
            select: {
              title: "titleEn",
              subtitle: "titleNl",
              media: "image",
            },
            prepare({ title, subtitle, media }) {
              return {
                title: title || "Untitled work",
                subtitle,
                media,
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
        title: title || "About me",
      };
    },
  },
});
