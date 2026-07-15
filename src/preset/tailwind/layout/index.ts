import type { UtilityTable } from "../../shared/utility-table.ts";
import { displayRules } from "./display.ts";
import { objectFitRules } from "./object-fit.ts";
import { objectPositionRules } from "./object-position.ts";
import { overflowRules } from "./overflow.ts";
import { overscrollRules } from "./overscroll.ts";
import { positionRules } from "./position.ts";
import { createZIndexRules } from "./z-index.ts";

// ONE canonical utility table. Key order = cascade order; keys are the utility file
// basenames and become the `layout/<slug>` names accepted by tailwindPreset.
// Factory utilities (z-index) are tuned via utility-path options, e.g.
// `options: { "layout/z-index": { max: 100 } }`.
export const layoutUtilities = {
  display: displayRules,
  "object-fit": objectFitRules,
  "object-position": objectPositionRules,
  overflow: overflowRules,
  overscroll: overscrollRules,
  position: positionRules,
  "z-index": createZIndexRules,
} satisfies UtilityTable;
