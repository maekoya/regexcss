import type { PageTable } from "../../shared/page-table.ts";
import { alignContentRules } from "./align-content.ts";
import { alignItemsRules } from "./align-items.ts";
import { alignSelfRules } from "./align-self.ts";
import { flexDirectionRules } from "./flex-direction.ts";
import { flexWrapRules } from "./flex-wrap.ts";
import { createGapRules } from "./gap.ts";
import { gridAutoColumnsRules } from "./grid-auto-columns.ts";
import { gridAutoFlowRules } from "./grid-auto-flow.ts";
import { gridAutoRowsRules } from "./grid-auto-rows.ts";
import { createGridRowRules } from "./grid-row.ts";
import { createGridTemplateColumnsRules } from "./grid-template-columns.ts";
import { createGridTemplateRowsRules } from "./grid-template-rows.ts";
import { justifyContentRules } from "./justify-content.ts";
import { justifyItemsRules } from "./justify-items.ts";
import { justifySelfRules } from "./justify-self.ts";
import { createOrderRules } from "./order.ts";

// ONE canonical page table. Key order = cascade order; keys are the page file
// basenames and become the `flexbox-grid/<slug>` names accepted by tailwindPreset.
// Factory pages (gap, grid-row, grid-template-*, order) are tuned via
// page-path options, e.g. `options: { "flexbox-grid/gap": { max: 4 } }`.
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
