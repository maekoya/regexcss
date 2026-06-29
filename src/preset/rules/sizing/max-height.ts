import type { Rule } from "../../../types.ts";
import { makeSizingRules } from "./_shared.ts";

// max-height — https://tailwindcss.com/docs/max-height
export const maxHeightRules: Rule[] = makeSizingRules("max-h", "max", { screen: "100vh", axis: "h" }, (v) => ({
  "max-height": v,
}));
