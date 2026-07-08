import type { Rule } from "../../../types.ts";
import { displayRules } from "./display.ts";
import { objectFitRules } from "./object-fit.ts";
import { objectPositionRules } from "./object-position.ts";
import { overflowRules } from "./overflow.ts";
import { overscrollRules } from "./overscroll.ts";
import { positionRules } from "./position.ts";
import { createZIndexRules, type ZIndexOptions, zIndexRules } from "./z-index.ts";

// re-export individual presets for granular use. Each already carries its docs
// metadata (label / category / `preset` tag), so it stays fully described when
// imported and used on its own.
export {
  createZIndexRules,
  displayRules,
  objectFitRules,
  objectPositionRules,
  overflowRules,
  overscrollRules,
  positionRules,
  zIndexRules,
};
export type { ZIndexOptions };

export interface LayoutOptions {
  zIndex?: ZIndexOptions;
}

// aggregate factory — every preset in this category with per-page numeric caps.
export const createLayoutRules = (options: LayoutOptions = {}): Rule[] => [
  ...displayRules,
  ...objectFitRules,
  ...objectPositionRules,
  ...overflowRules,
  ...overscrollRules,
  ...positionRules,
  ...createZIndexRules(options.zIndex),
];

// aggregate — every preset in this category combined, with default caps.
export const layoutRules: Rule[] = createLayoutRules();
