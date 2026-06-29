import type { Rule } from "../../../types.ts";
import { makeSizingRules } from "./_shared.ts";

// min-height — https://tailwindcss.com/docs/min-height
export const minHeightRules: Rule[] = makeSizingRules("min-h", "min", { screen: "100vh", axis: "h" }, (v) => ({
  "min-height": v,
}));
