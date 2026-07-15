import type { PageTable } from "../../shared/page-table.ts";
import { backgroundColorRules } from "./background-color.ts";

// ONE canonical page table. Key order = cascade order; keys are the page file
// basenames and become the `color/<slug>` names accepted by tailwindPreset.
export const colorPages = {
  "background-color": backgroundColorRules,
} satisfies PageTable;
