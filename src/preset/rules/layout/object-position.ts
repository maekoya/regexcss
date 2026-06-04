import type { Rule } from "../../../types.ts";

// object-position — https://tailwindcss.com/docs/object-position
// class suffix -> CSS `object-position` value (some are two keywords).
const POSITIONS: Record<string, string> = {
  bottom: "bottom",
  center: "center",
  left: "left",
  "left-bottom": "left bottom",
  "left-top": "left top",
  right: "right",
  "right-bottom": "right bottom",
  "right-top": "right top",
  top: "top",
};

export const objectPositionRules: Rule[] = [
  [
    /^object-(left-bottom|left-top|right-bottom|right-top|bottom|center|left|right|top)$/,
    ([, k]) => ({ "object-position": POSITIONS[k ?? ""] ?? "" }),
  ],
];
