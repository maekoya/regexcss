import type { Rule } from "../../../types.ts";

// grid-template-columns — https://tailwindcss.com/docs/grid-template-columns
const KEYWORDS: Record<string, string> = {
  none: "none",
  subgrid: "subgrid",
};

export const gridTemplateColumnsRules: Rule[] = [
  [/^grid-cols-(none|subgrid)$/, ([, k]) => ({ "grid-template-columns": KEYWORDS[k ?? ""] ?? "" })],
  [/^grid-cols-(\d+)$/, ([, n]) => ({ "grid-template-columns": `repeat(${n}, minmax(0, 1fr))` })],
];
