import type { Rule } from "../../../types.ts";
import { withMeta } from "../../shared/with-meta.ts";
import { makeSizingRules } from "./_shared.ts";

// max-width — https://tailwindcss.com/docs/max-width

export interface MaxWidthOptions {
  /** Largest value the numeric scale accepts, inclusive (default 96). */
  max?: number;
}

export const createMaxWidthRules = ({ max }: MaxWidthOptions = {}): Rule[] =>
  withMeta(
    makeSizingRules("max-w", "max", { screen: "100vw", axis: "w", container: true, max }, (v) => ({ "max-width": v })),
    { label: "max-width", category: "sizing", tags: ["preset"] },
  );

export const maxWidthRules: Rule[] = createMaxWidthRules();
