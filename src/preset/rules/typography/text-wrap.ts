import type { Rule } from "../../../types.ts";

// text-wrap — https://tailwindcss.com/docs/text-wrap
export const textWrapRules: Rule[] = [[/^text-(wrap|nowrap|balance|pretty)$/, ([, v]) => ({ "text-wrap": v ?? "" })]];
