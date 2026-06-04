import type { Rule } from "../../../types.ts";

// grid-template-rows — https://tailwindcss.com/docs/grid-template-rows
const KEYWORDS: Record<string, string> = {
  none: "none",
  subgrid: "subgrid",
};

export const gridTemplateRowsRules: Rule[] = [
  [/^grid-rows-(none|subgrid)$/, ([, k]) => ({ "grid-template-rows": KEYWORDS[k ?? ""] ?? "" })],
  [/^grid-rows-(\d+)$/, ([, n]) => ({ "grid-template-rows": `repeat(${n}, minmax(0, 1fr))` })],
];
