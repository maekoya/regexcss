import type { Rule } from "../../../types.ts";

// vertical-align — https://tailwindcss.com/docs/vertical-align
export const verticalAlignRules: Rule[] = [
  [/^align-(baseline|text-top|text-bottom|top|middle|bottom|sub|super)$/, ([, v]) => ({ "vertical-align": v ?? "" })],
];
