import type { Rule } from "../../../types.ts";
import { heightRules } from "./height.ts";
import { maxHeightRules } from "./max-height.ts";
import { maxWidthRules } from "./max-width.ts";
import { minHeightRules } from "./min-height.ts";
import { minWidthRules } from "./min-width.ts";
import { sizeRules } from "./size.ts";
import { widthRules } from "./width.ts";

// re-export individual presets for granular use
export { heightRules, maxHeightRules, maxWidthRules, minHeightRules, minWidthRules, sizeRules, widthRules };

// aggregate — every preset in this category combined.
export const sizingRules: Rule[] = [
  ...widthRules,
  ...minWidthRules,
  ...maxWidthRules,
  ...heightRules,
  ...minHeightRules,
  ...maxHeightRules,
  ...sizeRules,
];
