import type { Rule } from "../../../types.ts";
import { withMeta } from "../with-meta.ts";

// grid-auto-rows — https://tailwindcss.com/docs/grid-auto-rows
const GRID_AUTO_ROWS: Record<string, string> = {
  auto: "auto",
  min: "min-content",
  max: "max-content",
  fr: "minmax(0, 1fr)",
};

export const gridAutoRowsRules: Rule[] = withMeta(
  [[/^auto-rows-(auto|min|max|fr)$/, ([, k]) => ({ "grid-auto-rows": GRID_AUTO_ROWS[k ?? ""] ?? "" })]],
  { label: "grid-auto-rows", category: "flexbox-grid", tags: ["preset"] },
);
