import type { Rule } from "../../../types.ts";

// grid-auto-columns — https://tailwindcss.com/docs/grid-auto-columns
const GRID_AUTO_COLUMNS: Record<string, string> = {
  auto: "auto",
  min: "min-content",
  max: "max-content",
  fr: "minmax(0, 1fr)",
};

export const gridAutoColumnsRules: Rule[] = [
  [/^auto-cols-(auto|min|max|fr)$/, ([, k]) => ({ "grid-auto-columns": GRID_AUTO_COLUMNS[k ?? ""] ?? "" })],
];
