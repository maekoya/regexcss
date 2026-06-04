import type { Rule } from "../../../types.ts";

// justify-items — https://tailwindcss.com/docs/justify-items
export const justifyItemsRules: Rule[] = [
  [/^justify-items-(normal|start|end|center|stretch)$/, ([, v]) => ({ "justify-items": v ?? "" })],
];
