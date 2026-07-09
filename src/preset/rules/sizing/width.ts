import type { Rule } from "../../../types.ts";
import { withMeta } from "../with-meta.ts";
import { makeSizingRules } from "./_shared.ts";

// width — https://tailwindcss.com/docs/width

export interface WidthOptions {
  /** Largest value the numeric scale accepts, inclusive (default 96). */
  max?: number;
}

export const createWidthRules = ({ max }: WidthOptions = {}): Rule[] =>
  withMeta(
    makeSizingRules("w", "base", { screen: "100vw", axis: "w", container: true, max }, (v) => ({ width: v })),
    { label: "width", category: "sizing", tags: ["preset"] },
  );

export const widthRules: Rule[] = createWidthRules();
