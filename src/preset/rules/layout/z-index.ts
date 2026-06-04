import type { Rule } from "../../../types.ts";

// z-index — https://tailwindcss.com/docs/z-index
// Tailwind ships a 0/10/.../50 scale, but we accept any integer (and negatives) dynamically.
export const zIndexRules: Rule[] = [
  [/^z-auto$/, () => ({ "z-index": "auto" })],
  [/^(-?)z-(\d+)$/, ([, neg, n]) => (n ? { "z-index": `${neg ?? ""}${n}` } : undefined)],
];
