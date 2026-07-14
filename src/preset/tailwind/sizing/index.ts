import { type PageOptionsOf, type PageTable, sharedPageOptions } from "../../shared/page-table.ts";
import { createHeightRules } from "./height.ts";
import { createMaxHeightRules } from "./max-height.ts";
import { createMaxWidthRules } from "./max-width.ts";
import { createMinHeightRules } from "./min-height.ts";
import { createMinWidthRules } from "./min-width.ts";
import { createSizeRules } from "./size.ts";
import { createWidthRules } from "./width.ts";

// ONE canonical page table. Key order = cascade order; keys are the page file
// basenames and become the `sizing/<slug>` names accepted by tailwindPreset.
export const sizingPages = {
  width: createWidthRules,
  "min-width": createMinWidthRules,
  "max-width": createMaxWidthRules,
  height: createHeightRules,
  "min-height": createMinHeightRules,
  "max-height": createMaxHeightRules,
  size: createSizeRules,
} satisfies PageTable;

export interface SizingOptions {
  /** Largest value the numeric scale accepts, inclusive (default 96). Applies to every axis. */
  max?: number;
}

// One shared options bag for every page (SizingOptions is structurally each page's own options).
export const sizingPageOptions = (options: SizingOptions = {}): PageOptionsOf<typeof sizingPages> =>
  sharedPageOptions(sizingPages, options);
