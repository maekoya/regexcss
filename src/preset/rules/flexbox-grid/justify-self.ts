import type { Rule } from "../../../types.ts";

// justify-self — https://tailwindcss.com/docs/justify-self
export const justifySelfRules: Rule[] = [
  [/^justify-self-(auto|start|end|center|stretch)$/, ([, v]) => ({ "justify-self": v ?? "" })],
];
