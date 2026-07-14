import type { PageOptionsOf, PageTable } from "../../shared/page-table.ts";
import { alignContentRules } from "./align-content.ts";
import { alignItemsRules } from "./align-items.ts";
import { alignSelfRules } from "./align-self.ts";
import { flexDirectionRules } from "./flex-direction.ts";
import { flexWrapRules } from "./flex-wrap.ts";
import { createGapRules, type GapOptions } from "./gap.ts";
import { gridAutoColumnsRules } from "./grid-auto-columns.ts";
import { gridAutoFlowRules } from "./grid-auto-flow.ts";
import { gridAutoRowsRules } from "./grid-auto-rows.ts";
import { createGridRowRules, type GridRowOptions } from "./grid-row.ts";
import { createGridTemplateColumnsRules, type GridTemplateColumnsOptions } from "./grid-template-columns.ts";
import { createGridTemplateRowsRules, type GridTemplateRowsOptions } from "./grid-template-rows.ts";
import { justifyContentRules } from "./justify-content.ts";
import { justifyItemsRules } from "./justify-items.ts";
import { justifySelfRules } from "./justify-self.ts";
import { createOrderRules, type OrderOptions } from "./order.ts";

// ONE canonical page table. Key order = cascade order; keys are the page file
// basenames and become the `flexbox-grid/<slug>` names accepted by tailwindPreset.
export const flexboxGridPages = {
  "align-content": alignContentRules,
  "align-items": alignItemsRules,
  "align-self": alignSelfRules,
  "flex-direction": flexDirectionRules,
  "flex-wrap": flexWrapRules,
  gap: createGapRules,
  "grid-auto-columns": gridAutoColumnsRules,
  "grid-auto-flow": gridAutoFlowRules,
  "grid-auto-rows": gridAutoRowsRules,
  "grid-row": createGridRowRules,
  "grid-template-columns": createGridTemplateColumnsRules,
  "grid-template-rows": createGridTemplateRowsRules,
  "justify-content": justifyContentRules,
  "justify-items": justifyItemsRules,
  "justify-self": justifySelfRules,
  order: createOrderRules,
} satisfies PageTable;

export interface FlexboxGridOptions {
  gap?: GapOptions;
  gridRow?: GridRowOptions;
  gridTemplateColumns?: GridTemplateColumnsOptions;
  gridTemplateRows?: GridTemplateRowsOptions;
  order?: OrderOptions;
}

// Routes category options to page slugs; consumed by tailwindPreset.
export const flexboxGridPageOptions = (options: FlexboxGridOptions = {}): PageOptionsOf<typeof flexboxGridPages> => ({
  gap: options.gap,
  "grid-row": options.gridRow,
  "grid-template-columns": options.gridTemplateColumns,
  "grid-template-rows": options.gridTemplateRows,
  order: options.order,
});
