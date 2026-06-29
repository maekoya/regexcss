import type { Rule } from "../../../types.ts";
import { makeSizingRules } from "./_shared.ts";

// width — https://tailwindcss.com/docs/width
export const widthRules: Rule[] = makeSizingRules(
  "w",
  "base",
  { screen: "100vw", axis: "w", container: true },
  (v) => ({ width: v }),
);
