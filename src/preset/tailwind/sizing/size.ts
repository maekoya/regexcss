import type { Rule } from "../../../types.ts";
import { withMeta } from "../../shared/with-meta.ts";
import { makeSizingRules } from "./_shared.ts";

// size — https://tailwindcss.com/docs/width#setting-both-width-and-height
// sets width and height simultaneously. no `screen` keyword (the two axes differ).

export interface SizeOptions {
  /** Largest value the numeric scale accepts, inclusive (default 96). */
  max?: number;
}

export const createSizeRules = ({ max }: SizeOptions = {}): Rule[] =>
  withMeta(
    makeSizingRules("size", "base", { axis: "w", container: true, max }, (v) => ({ width: v, height: v })),
    { label: "size", category: "sizing", tags: ["preset"] },
  );