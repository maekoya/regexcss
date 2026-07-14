import type { PageOptionsOf, PageTable } from "../../shared/page-table.ts";
import { backgroundColorRules } from "./background-color.ts";

// ONE canonical page table. Key order = cascade order; keys are the page file
// basenames and become the `color/<slug>` names accepted by tailwindPreset.
export const colorPages = {
  "background-color": backgroundColorRules,
} satisfies PageTable;

// no per-page numeric caps in this category yet; the empty options bag keeps
// every category on the same shape.
export interface ColorOptions {}

// Routes category options to page slugs; consumed by tailwindPreset.
export const colorPageOptions = (_options: ColorOptions = {}): PageOptionsOf<typeof colorPages> => ({});
