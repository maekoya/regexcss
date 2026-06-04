import type { Rule } from "../../../types.ts";

// background-color — https://tailwindcss.com/docs/background-color
export const backgroundColorRules: Rule[] = [[/^bg-(\w+)$/, ([, color]) => ({ backgroundColor: color ?? "" })]];
