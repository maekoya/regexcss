import type { Rule } from "../../../types.ts";

// text-overflow — https://tailwindcss.com/docs/text-overflow
export const textOverflowRules: Rule[] = [
  [/^truncate$/, () => ({ overflow: "hidden", "text-overflow": "ellipsis", "white-space": "nowrap" })],
  [/^text-(ellipsis|clip)$/, ([, v]) => ({ "text-overflow": v ?? "" })],
];
