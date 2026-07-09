import type { Rule } from "../../../types.ts";
import { backgroundColorRules } from "./background-color.ts";

// re-export individual presets for granular use. Each already carries its docs
// metadata (label / category / `preset` tag), so it stays fully described when
// imported and used on its own.
export { backgroundColorRules };

// aggregate — every preset in this category combined.
export const colorRules: Rule[] = [...backgroundColorRules];
