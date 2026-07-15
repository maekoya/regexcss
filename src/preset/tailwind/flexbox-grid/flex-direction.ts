import type { Rule } from "../../../types.ts";
import { withMeta } from "../../shared/with-meta.ts";

// flex-direction — https://tailwindcss.com/docs/flex-direction
// class uses `col`, CSS value is `column`, so a value map is needed.
const FLEX_DIRECTION: Record<string, string> = {
  row: "row",
  "row-reverse": "row-reverse",
  col: "column",
  "col-reverse": "column-reverse",
};

export const flexDirectionRules: Rule[] = withMeta(
  [[/^flex-(row-reverse|row|col-reverse|col)$/, ([, k]) => ({ "flex-direction": FLEX_DIRECTION[k ?? ""] ?? "" })]],
  { label: "flex-direction", category: "flexbox-grid", tags: ["preset"] },
);
