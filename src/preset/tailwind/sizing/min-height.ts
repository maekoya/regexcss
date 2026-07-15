import type { Rule } from "../../../types.ts";
import { withMeta } from "../../shared/with-meta.ts";
import { makeSizingRules } from "./_shared.ts";

// min-height — https://tailwindcss.com/docs/min-height

export interface MinHeightOptions {
  /** Largest value the numeric scale accepts, inclusive (default 96). */
  max?: number;
}

export const createMinHeightRules = ({ max }: MinHeightOptions = {}): Rule[] =>
  withMeta(
    makeSizingRules("min-h", "min", { screen: "100vh", axis: "h", max }, (v) => ({ "min-height": v })),
    { label: "min-height", category: "sizing", tags: ["preset", "tailwind"] },
  );
