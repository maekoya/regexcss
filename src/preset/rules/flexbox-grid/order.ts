import type { Rule } from "../../../types.ts";

// order — https://tailwindcss.com/docs/order
const KEYWORDS: Record<string, string> = {
  first: "calc(-infinity)",
  last: "calc(infinity)",
  none: "0",
};

export const orderRules: Rule[] = [
  [/^order-(first|last|none)$/, ([, k]) => ({ order: KEYWORDS[k ?? ""] ?? "" })],
  [/^(-?)order-(\d+)$/, ([, neg, n]) => (n ? { order: `${neg ?? ""}${n}` } : undefined)],
];
