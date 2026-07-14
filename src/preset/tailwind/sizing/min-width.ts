import type { Rule } from "../../../types.ts";
import { withMeta } from "../../shared/with-meta.ts";
import { makeSizingRules } from "./_shared.ts";

// min-width — https://tailwindcss.com/docs/min-width

export interface MinWidthOptions {
  /** Largest value the numeric scale accepts, inclusive (default 96). */
  max?: number;
}

export const createMinWidthRules = ({ max }: MinWidthOptions = {}): Rule[] =>
  withMeta(
    makeSizingRules("min-w", "min", { screen: "100vw", axis: "w", max }, (v) => ({ "min-width": v })),
    { label: "min-width", category: "sizing", tags: ["preset"] },
  );

export const minWidthRules: Rule[] = createMinWidthRules();
