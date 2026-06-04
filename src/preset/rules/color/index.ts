import type { Rule } from "../../../types.ts";
import { backgroundColorRules } from "./background-color.ts";

// re-export individual presets for granular use
export { backgroundColorRules };

// aggregate — every preset in this category combined.
export const colorRules: Rule[] = [...backgroundColorRules];
