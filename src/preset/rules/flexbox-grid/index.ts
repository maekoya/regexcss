import type { Rule } from "../../../types.ts";
import { alignContentRules } from "./align-content.ts";
import { alignItemsRules } from "./align-items.ts";
import { alignSelfRules } from "./align-self.ts";
import { gapRules } from "./gap.ts";
import { gridTemplateColumnsRules } from "./grid-template-columns.ts";
import { gridTemplateRowsRules } from "./grid-template-rows.ts";
import { justifyContentRules } from "./justify-content.ts";
import { justifyItemsRules } from "./justify-items.ts";
import { justifySelfRules } from "./justify-self.ts";
import { orderRules } from "./order.ts";

// re-export individual presets for granular use
export {
  alignContentRules,
  alignItemsRules,
  alignSelfRules,
  gapRules,
  gridTemplateColumnsRules,
  gridTemplateRowsRules,
  justifyContentRules,
  justifyItemsRules,
  justifySelfRules,
  orderRules,
};

// aggregate — every preset in this category combined.
export const flexboxGridRules: Rule[] = [
  ...alignContentRules,
  ...alignItemsRules,
  ...alignSelfRules,
  ...gapRules,
  ...gridTemplateColumnsRules,
  ...gridTemplateRowsRules,
  ...justifyContentRules,
  ...justifyItemsRules,
  ...justifySelfRules,
  ...orderRules,
];
