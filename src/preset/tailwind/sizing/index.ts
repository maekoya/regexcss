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
  /**
   * CSS variable prefix for the container-scale tokens (`w-3xs` →
   * `var(--<baseContainerTokenPrefix>-3xs)`, default "container"). Applies to the axes
   * that have the container scale (`w`, `max-w`, `size`).
   */
  baseContainerTokenPrefix?: string;
  /**
   * Drop the container-scale token rules entirely (`w-3xs` ... `w-7xl`,
   * `max-w-*`, `size-*` token keywords stop matching). Wins over
   * `baseContainerTokenPrefix`; override per axis via utility-path options
   * (e.g. `"sizing/width": { excludeContainerClasses: false }`). Default false.
   */
  excludeContainerClasses?: boolean;
}

// One shared options bag for every utility (SizingOptions is structurally each utility's own options).
export const sizingUtilityOptions = (options: SizingOptions = {}): UtilityOptionsOf<typeof sizingUtilities> =>
  sharedUtilityOptions(sizingUtilities, options);
