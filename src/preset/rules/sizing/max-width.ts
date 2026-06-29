import type { Rule } from "../../../types.ts";
import { makeSizingRules } from "./_shared.ts";

// max-width — https://tailwindcss.com/docs/max-width
export const maxWidthRules: Rule[] = makeSizingRules(
  "max-w",
  "max",
  { screen: "100vw", axis: "w", container: true },
  (v) => ({ "max-width": v }),
);
