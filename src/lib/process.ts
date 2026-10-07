/**
 * The one process used on the homepage (compact) and the Werkwijze page (with a little more
 * detail): same three steps, order and visuals. Texts live in messages under "Process".
 * Images: Meet / Create / Deliver visuals supplied for the site — illustration of the steps only,
 * see assets/visual-originals/SOURCES.md.
 */
export const PROCESS_STEPS = [
  { key: "meet", image: "werkwijze-kennismaken" },
  { key: "create", image: "werkwijze-creeren" },
  { key: "deliver", image: "werkwijze-opleveren" },
] as const;

export type ProcessStepKey = (typeof PROCESS_STEPS)[number]["key"];
