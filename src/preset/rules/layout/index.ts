import type { Rule } from "../../../types.ts";
import { displayRules } from "./display.ts";
import { objectFitRules } from "./object-fit.ts";
import { objectPositionRules } from "./object-position.ts";
import { overflowRules } from "./overflow.ts";
import { overscrollRules } from "./overscroll.ts";
import { positionRules } from "./position.ts";
import { zIndexRules } from "./z-index.ts";

// re-export individual presets for granular use
export {
  displayRules,
  objectFitRules,
  objectPositionRules,
  overflowRules,
  overscrollRules,
  positionRules,
  zIndexRules,
};

// aggregate — every preset in this category combined.
export const layoutRules: Rule[] = [
  ...displayRules,
  ...objectFitRules,
  ...objectPositionRules,
  ...overflowRules,
  ...overscrollRules,
  ...positionRules,
  ...zIndexRules,
];
