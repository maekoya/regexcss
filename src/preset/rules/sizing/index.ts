import type { Rule } from "../../../types.ts";
import { createHeightRules, type HeightOptions, heightRules } from "./height.ts";
import { createMaxHeightRules, type MaxHeightOptions, maxHeightRules } from "./max-height.ts";
import { createMaxWidthRules, type MaxWidthOptions, maxWidthRules } from "./max-width.ts";
import { createMinHeightRules, type MinHeightOptions, minHeightRules } from "./min-height.ts";
import { createMinWidthRules, type MinWidthOptions, minWidthRules } from "./min-width.ts";
import { createSizeRules, type SizeOptions, sizeRules } from "./size.ts";
import { createWidthRules, type WidthOptions, widthRules } from "./width.ts";

// re-export individual presets for granular use. Each already carries its docs
// metadata (label / category / `preset` tag), so it stays fully described when
// imported and used on its own.
export {
  createHeightRules,
  createMaxHeightRules,
  createMaxWidthRules,
  createMinHeightRules,
  createMinWidthRules,
  createSizeRules,
  createWidthRules,
  heightRules,
  maxHeightRules,
  maxWidthRules,
  minHeightRules,
  minWidthRules,
  sizeRules,
  widthRules,
};
export type {
  HeightOptions,
  MaxHeightOptions,
  MaxWidthOptions,
  MinHeightOptions,
  MinWidthOptions,
  SizeOptions,
  WidthOptions,
};

export interface SizingOptions {
  /** Largest value the numeric scale accepts, inclusive (default 96). Applies to every axis. */
  max?: number;
}

// aggregate factory — every preset in this category with a shared numeric cap.
export const createSizingRules = (options: SizingOptions = {}): Rule[] => [
  ...createWidthRules(options),
  ...createMinWidthRules(options),
  ...createMaxWidthRules(options),
  ...createHeightRules(options),
  ...createMinHeightRules(options),
  ...createMaxHeightRules(options),
  ...createSizeRules(options),
];

// aggregate — every preset in this category combined, with default caps.
export const sizingRules: Rule[] = createSizingRules();
