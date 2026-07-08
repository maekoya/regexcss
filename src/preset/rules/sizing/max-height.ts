import type { Rule } from "../../../types.ts";
import { withMeta } from "../with-meta.ts";
import { makeSizingRules } from "./_shared.ts";

// max-height — https://tailwindcss.com/docs/max-height

export interface MaxHeightOptions {
  /** Largest value the numeric scale accepts, inclusive (default 96). */
  max?: number;
}

export const createMaxHeightRules = ({ max }: MaxHeightOptions = {}): Rule[] =>
  withMeta(
    makeSizingRules("max-h", "max", { screen: "100vh", axis: "h", max }, (v) => ({ "max-height": v })),
    { label: "max-height", category: "sizing", tags: ["preset"] },
  );

export const maxHeightRules: Rule[] = createMaxHeightRules();
