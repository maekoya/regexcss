import { type UtilityOptionsOf, type UtilityTable, sharedUtilityOptions } from "../../shared/utility-table.ts";
import { createMarginRules } from "./margin.ts";
import { createPaddingRules } from "./padding.ts";

// ONE canonical utility table. Key order = cascade order; keys are the utility file
// basenames and become the `spacing/<slug>` names accepted by tailwindPreset.
export const spacingUtilities = {
  margin: createMarginRules,
  padding: createPaddingRules,
} satisfies UtilityTable;

export interface SpacingOptions {
  /** Largest value the numeric scale accepts, inclusive (default 96). Applies to both margin and padding. */
  max?: number;
  /**
   * Drop the negative-margin rules (`-m-2`, `-mx-4`, ...). Only margin has
   * negatives, so this affects `spacing/margin`. Default false.
   */
  excludeNegativeClasses?: boolean;
}

// One shared options bag for every utility (SpacingOptions is structurally each utility's own options).
export const spacingUtilityOptions = (options: SpacingOptions = {}): UtilityOptionsOf<typeof spacingUtilities> =>
  sharedUtilityOptions(spacingUtilities, options);
