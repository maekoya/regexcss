import type { Rule } from "../../../types.ts";
import { withMeta } from "../with-meta.ts";
import { makeSizingRules } from "./_shared.ts";

// height — https://tailwindcss.com/docs/height

export interface HeightOptions {
  /** Largest value the numeric scale accepts, inclusive (default 96). */
  max?: number;
}

export const createHeightRules = ({ max }: HeightOptions = {}): Rule[] =>
  withMeta(
    makeSizingRules("h", "base", { screen: "100vh", axis: "h", max }, (v) => ({ height: v })),
    { label: "height", category: "sizing", tags: ["preset"] },
  );

export const heightRules: Rule[] = createHeightRules();
