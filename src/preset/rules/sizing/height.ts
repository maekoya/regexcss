import type { Rule } from "../../../types.ts";
import { makeSizingRules } from "./_shared.ts";

// height — https://tailwindcss.com/docs/height
export const heightRules: Rule[] = makeSizingRules("h", "base", { screen: "100vh", axis: "h" }, (v) => ({ height: v }));
