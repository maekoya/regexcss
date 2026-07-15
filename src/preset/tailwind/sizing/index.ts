import { type UtilityOptionsOf, type UtilityTable, sharedUtilityOptions } from "../../shared/utility-table.ts";
import { createHeightRules } from "./height.ts";
import { createMaxHeightRules } from "./max-height.ts";
import { createMaxWidthRules } from "./max-width.ts";
import { createMinHeightRules } from "./min-height.ts";
import { createMinWidthRules } from "./min-width.ts";
import { createSizeRules } from "./size.ts";
import { createWidthRules } from "./width.ts";

// ONE canonical utility table. Key order = cascade order; keys are the utility file
// basenames and become the `sizing/<slug>` names accepted by tailwindPreset.
export const sizingUtilities = {
  width: createWidthRules,
  "min-width": createMinWidthRules,
  "max-width": createMaxWidthRules,
  height: createHeightRules,
  "min-height": createMinHeightRules,
  "max-height": createMaxHeightRules,
  size: createSizeRules,
} satisfies UtilityTable;

export interface SizingOptions {
  /** Largest value the numeric scale accepts, inclusive (default 96). Applies to every axis. */
  max?: number;
}

// One shared options bag for every utility (SizingOptions is structurally each utility's own options).
export const sizingUtilityOptions = (options: SizingOptions = {}): UtilityOptionsOf<typeof sizingUtilities> =>
  sharedUtilityOptions(sizingUtilities, options);
