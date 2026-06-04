import type { Rule } from "../../../types.ts";
import { marginRules } from "./margin.ts";
import { paddingRules } from "./padding.ts";

// re-export individual presets for granular use
export { marginRules, paddingRules };

// aggregate — every preset in this category combined.
export const spacingRules: Rule[] = [...marginRules, ...paddingRules];
