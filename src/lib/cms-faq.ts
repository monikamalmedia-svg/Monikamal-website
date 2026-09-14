export type CmsFaqQuestion = {
  questionEn?: string | null;
  questionNl?: string | null;
  answerEn?: string | null;
  answerNl?: string | null;
  order?: number | null;
};

export type FaqSectionDoc = {
  headingEn?: string | null;
  headingNl?: string | null;
  subheadingEn?: string | null;
  subheadingNl?: string | null;
  questions?: CmsFaqQuestion[] | null;
};

export type DisplayFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export const FAQ_SECTION_QUERY = `*[_type == "faqSection"][0]{
  headingEn,
  headingNl,
  subheadingEn,
  subheadingNl,
  questions[]{
    questionEn,
    questionNl,
    answerEn,
    answerNl,
    order
  }
}`;

export const FAQ_FALLBACK_IDS = [
  "turnaround",
  "product",
  "ads",
  "revisions",
  "payment",
] as const;

function localeString(
  isNl: boolean,
  en?: string | null,
  nl?: string | null,
): string {
  return ((isNl ? nl : en) || en || nl || "").trim();
}

export function cmsHeading(
  isNl: boolean,
  headingEn?: string | null,
  headingNl?: string | null,
): string {
  return localeString(isNl, headingEn, headingNl);
}

export function mapFaqQuestions(
  isNl: boolean,
  questions: CmsFaqQuestion[] | null | undefined,
): DisplayFaqItem[] {
  return [...(questions ?? [])]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((item, index) => {
      const question = localeString(isNl, item.questionEn, item.questionNl);
      const answer = localeString(isNl, item.answerEn, item.answerNl);
      if (!question && !answer) return null;
      return {
        id: `cms-${index}`,
        question: question || answer,
        answer,
      };
    })
    .filter((item): item is DisplayFaqItem => item != null);
}
