import type { Rule } from "../../../types.ts";

// white-space — https://tailwindcss.com/docs/whitespace
export const whiteSpaceRules: Rule[] = [
  [/^whitespace-(normal|nowrap|pre-line|pre-wrap|pre|break-spaces)$/, ([, v]) => ({ "white-space": v ?? "" })],
];
