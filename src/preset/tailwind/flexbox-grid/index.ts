import type { UtilityTable } from "../../shared/utility-table.ts";
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

// ONE canonical utility table. Key order = cascade order; keys are the utility file
// basenames and become the `flexbox-grid/<slug>` names accepted by tailwindPreset.
// Factory utilities (gap, grid-row, grid-template-*, order) are tuned via
// utility-path options, e.g. `options: { "flexbox-grid/gap": { max: 4 } }`.
export const flexboxGridUtilities = {
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
} satisfies UtilityTable;
