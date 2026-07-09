import type { Rule } from "../../../types.ts";
import { alignContentRules } from "./align-content.ts";
import { alignItemsRules } from "./align-items.ts";
import { alignSelfRules } from "./align-self.ts";
import { flexDirectionRules } from "./flex-direction.ts";
import { flexWrapRules } from "./flex-wrap.ts";
import { createGapRules, type GapOptions, gapRules } from "./gap.ts";
import { gridAutoColumnsRules } from "./grid-auto-columns.ts";
import { gridAutoFlowRules } from "./grid-auto-flow.ts";
import { gridAutoRowsRules } from "./grid-auto-rows.ts";
import { createGridRowRules, type GridRowOptions, gridRowRules } from "./grid-row.ts";
import {
  createGridTemplateColumnsRules,
  type GridTemplateColumnsOptions,
  gridTemplateColumnsRules,
} from "./grid-template-columns.ts";
import {
  createGridTemplateRowsRules,
  type GridTemplateRowsOptions,
  gridTemplateRowsRules,
} from "./grid-template-rows.ts";
import { justifyContentRules } from "./justify-content.ts";
import { justifyItemsRules } from "./justify-items.ts";
import { justifySelfRules } from "./justify-self.ts";
import { createOrderRules, orderRules, type OrderOptions } from "./order.ts";

// re-export individual presets for granular use. Each already carries its docs
// metadata (label / category / `preset` tag), so it stays fully described when
// imported and used on its own.
export {
  alignContentRules,
  alignItemsRules,
  alignSelfRules,
  createGapRules,
  createGridRowRules,
  createGridTemplateColumnsRules,
  createGridTemplateRowsRules,
  createOrderRules,
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
export type { GapOptions, GridRowOptions, GridTemplateColumnsOptions, GridTemplateRowsOptions, OrderOptions };

export interface FlexboxGridOptions {
  gap?: GapOptions;
  gridRow?: GridRowOptions;
  gridTemplateColumns?: GridTemplateColumnsOptions;
  gridTemplateRows?: GridTemplateRowsOptions;
  order?: OrderOptions;
}

// aggregate factory — every preset in this category with per-page numeric caps.
export const createFlexboxGridRules = (options: FlexboxGridOptions = {}): Rule[] => [
  ...alignContentRules,
  ...alignItemsRules,
  ...alignSelfRules,
  ...flexDirectionRules,
  ...flexWrapRules,
  ...createGapRules(options.gap),
  ...gridAutoColumnsRules,
  ...gridAutoFlowRules,
  ...gridAutoRowsRules,
  ...createGridRowRules(options.gridRow),
  ...createGridTemplateColumnsRules(options.gridTemplateColumns),
  ...createGridTemplateRowsRules(options.gridTemplateRows),
  ...justifyContentRules,
  ...justifyItemsRules,
  ...justifySelfRules,
  ...createOrderRules(options.order),
];

// aggregate — every preset in this category combined, with default caps.
export const flexboxGridRules: Rule[] = createFlexboxGridRules();
