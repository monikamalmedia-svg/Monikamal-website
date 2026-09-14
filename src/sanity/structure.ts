import type {StructureResolver} from 'sanity/structure'

const ABOUT_PAGE_ID = 'aboutPage'
const HERO_SECTION_ID = 'heroSection'
const PRICING_SECTION_ID = 'pricingSection'
const PHOTO_PRICING_SECTION_ID = 'photoPricingSection'
const FAQ_SECTION_ID = 'faqSection'
const SITE_SETTINGS_ID = 'siteSettings'

const singletonTypeIds = new Set([
  ABOUT_PAGE_ID,
  HERO_SECTION_ID,
  PRICING_SECTION_ID,
  PHOTO_PRICING_SECTION_ID,
  FAQ_SECTION_ID,
  SITE_SETTINGS_ID,
])

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Hero section')
        .id(HERO_SECTION_ID)
        .child(
          S.document().schemaType('heroSection').documentId(HERO_SECTION_ID),
        ),
      S.listItem()
        .title('About me')
        .id(ABOUT_PAGE_ID)
        .child(
          S.document().schemaType('aboutPage').documentId(ABOUT_PAGE_ID),
        ),
      S.listItem()
        .title('Pricing (video packages)')
        .id(PRICING_SECTION_ID)
        .child(
          S.document().schemaType('pricingSection').documentId(PRICING_SECTION_ID),
        ),
      S.listItem()
        .title('Pricing (photo packages)')
        .id(PHOTO_PRICING_SECTION_ID)
        .child(
          S.document()
            .schemaType('photoPricingSection')
            .documentId(PHOTO_PRICING_SECTION_ID),
        ),
      S.listItem()
        .title('FAQ')
        .id(FAQ_SECTION_ID)
        .child(
          S.document().schemaType('faqSection').documentId(FAQ_SECTION_ID),
        ),
      S.listItem()
        .title('Site settings')
        .id(SITE_SETTINGS_ID)
        .child(
          S.document().schemaType('siteSettings').documentId(SITE_SETTINGS_ID),
        ),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => !singletonTypeIds.has(item.getId() ?? ''),
      ),
    ])
