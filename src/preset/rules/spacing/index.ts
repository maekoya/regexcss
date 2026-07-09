import type { Rule } from "../../../types.ts";
import { createMarginRules, type MarginOptions, marginRules } from "./margin.ts";
import { createPaddingRules, type PaddingOptions, paddingRules } from "./padding.ts";

// re-export individual presets for granular use. Each already carries its docs
// metadata (label / category / `preset` tag), so it stays fully described when
// imported and used on its own.
export { createMarginRules, createPaddingRules, marginRules, paddingRules };
export type { MarginOptions, PaddingOptions };

export interface SpacingOptions {
  /** Largest value the numeric scale accepts, inclusive (default 96). Applies to both margin and padding. */
  max?: number;
}

// aggregate factory — every preset in this category with a shared numeric cap.
export const createSpacingRules = (options: SpacingOptions = {}): Rule[] => [
  ...createMarginRules(options),
  ...createPaddingRules(options),
];

// aggregate — every preset in this category combined, with default caps.
export const spacingRules: Rule[] = createSpacingRules();
