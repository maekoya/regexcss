import type { Rule } from "../../../types.ts";

// text-align — https://tailwindcss.com/docs/text-align
export const textAlignRules: Rule[] = [
  [/^text-(left|center|right|justify)$/, ([, align]) => ({ "text-align": align ?? "" })],
];
