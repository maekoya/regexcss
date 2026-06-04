import type { Rule } from "../../../types.ts";

// object-fit — https://tailwindcss.com/docs/object-fit
export const objectFitRules: Rule[] = [
  [/^object-(contain|cover|fill|none|scale-down)$/, ([, v]) => ({ "object-fit": v ?? "" })],
];
