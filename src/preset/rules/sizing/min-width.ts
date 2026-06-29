import type { Rule } from "../../../types.ts";
import { makeSizingRules } from "./_shared.ts";

// min-width — https://tailwindcss.com/docs/min-width
export const minWidthRules: Rule[] = makeSizingRules("min-w", "min", { screen: "100vw", axis: "w" }, (v) => ({
  "min-width": v,
}));
