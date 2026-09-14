import { type SchemaTypeDefinition } from "sanity";
import { aboutPage } from "./aboutPage";
import { caseStudy } from "./caseStudy";
import { faqSection } from "./faqSection";
import { heroSection } from "./heroSection";
import { photoPricingSection } from "./photoPricingSection";
import { pricingSection } from "./pricingSection";
import { siteSettings } from "./siteSettings";

export const schemaTypes: SchemaTypeDefinition[] = [
  aboutPage,
  caseStudy,
  heroSection,
  pricingSection,
  photoPricingSection,
  faqSection,
  siteSettings,
];
