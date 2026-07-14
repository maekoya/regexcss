import { type PageOptionsOf, type PageTable, sharedPageOptions } from "../../shared/page-table.ts";
import { createMarginRules } from "./margin.ts";
import { createPaddingRules } from "./padding.ts";

// ONE canonical page table. Key order = cascade order; keys are the page file
// basenames and become the `spacing/<slug>` names accepted by tailwindPreset.
export const spacingPages = {
  margin: createMarginRules,
  padding: createPaddingRules,
} satisfies PageTable;

export interface SpacingOptions {
  /** Largest value the numeric scale accepts, inclusive (default 96). Applies to both margin and padding. */
  max?: number;
}

// One shared options bag for every page (SpacingOptions is structurally each page's own options).
export const spacingPageOptions = (options: SpacingOptions = {}): PageOptionsOf<typeof spacingPages> =>
  sharedPageOptions(spacingPages, options);
