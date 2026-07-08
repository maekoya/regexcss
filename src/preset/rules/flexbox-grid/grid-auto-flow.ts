import type { Rule } from "../../../types.ts";
import { withMeta } from "../with-meta.ts";

// grid-auto-flow — https://tailwindcss.com/docs/grid-auto-flow
// class names differ from CSS values (col -> column, *-dense -> "* dense").
const GRID_AUTO_FLOW: Record<string, string> = {
  row: "row",
  col: "column",
  dense: "dense",
  "row-dense": "row dense",
  "col-dense": "column dense",
};

export const gridAutoFlowRules: Rule[] = withMeta(
  [
    [
      /^grid-flow-(row-dense|col-dense|row|col|dense)$/,
      ([, k]) => ({ "grid-auto-flow": GRID_AUTO_FLOW[k ?? ""] ?? "" }),
    ],
  ],
  { label: "grid-auto-flow", category: "flexbox-grid", tags: ["preset"] },
);
