import type { Rule } from "../../../types.ts";
import { makeSizingRules } from "./_shared.ts";

// size — https://tailwindcss.com/docs/width#setting-both-width-and-height
// sets width and height simultaneously. no `screen` keyword (the two axes differ).
export const sizeRules: Rule[] = makeSizingRules("size", "base", { axis: "w", container: true }, (v) => ({
  width: v,
  height: v,
}));
