import type { Rule } from "../../../types.ts";
import { alignContentRules } from "./align-content.ts";
import { alignItemsRules } from "./align-items.ts";
import { alignSelfRules } from "./align-self.ts";
import { flexDirectionRules } from "./flex-direction.ts";
import { flexWrapRules } from "./flex-wrap.ts";
import { gapRules } from "./gap.ts";
import { gridAutoColumnsRules } from "./grid-auto-columns.ts";
import { gridAutoFlowRules } from "./grid-auto-flow.ts";
import { gridAutoRowsRules } from "./grid-auto-rows.ts";
import { gridRowRules } from "./grid-row.ts";
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
  flexDirectionRules,
  flexWrapRules,
  gapRules,
  gridAutoColumnsRules,
  gridAutoFlowRules,
  gridAutoRowsRules,
  gridRowRules,
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
  ...flexDirectionRules,
  ...flexWrapRules,
  ...gapRules,
  ...gridAutoColumnsRules,
  ...gridAutoFlowRules,
  ...gridAutoRowsRules,
  ...gridRowRules,
  ...gridTemplateColumnsRules,
  ...gridTemplateRowsRules,
  ...justifyContentRules,
  ...justifyItemsRules,
  ...justifySelfRules,
  ...orderRules,
];
