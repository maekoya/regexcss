import type { UtilityTable } from "../../shared/utility-table.ts";
import { backgroundColorRules } from "./background-color.ts";

// ONE canonical utility table. Key order = cascade order; keys are the utility file
// basenames and become the `color/<slug>` names accepted by tailwindPreset.
export const colorUtilities = {
  "background-color": backgroundColorRules,
} satisfies UtilityTable;
