import type { PageTable } from "../../shared/page-table.ts";
import { displayRules } from "./display.ts";
import { objectFitRules } from "./object-fit.ts";
import { objectPositionRules } from "./object-position.ts";
import { overflowRules } from "./overflow.ts";
import { overscrollRules } from "./overscroll.ts";
import { positionRules } from "./position.ts";
import { createZIndexRules } from "./z-index.ts";

// ONE canonical page table. Key order = cascade order; keys are the page file
// basenames and become the `layout/<slug>` names accepted by tailwindPreset.
// Factory pages (z-index) are tuned via page-path options, e.g.
// `options: { "layout/z-index": { max: 100 } }`.
export const layoutPages = {
  display: displayRules,
  "object-fit": objectFitRules,
  "object-position": objectPositionRules,
  overflow: overflowRules,
  overscroll: overscrollRules,
  position: positionRules,
  "z-index": createZIndexRules,
} satisfies PageTable;
