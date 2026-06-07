import type { Rule } from "../../../types.ts";

// grid-row — https://tailwindcss.com/docs/grid-row
// Covers the `grid-row` shorthand plus `grid-row-start` / `grid-row-end`.
// Numeric line utilities are dynamic; negatives use the unified `(-?)` capture.
export const gridRowRules: Rule[] = [
  [/^row-auto$/, () => ({ "grid-row": "auto" })],
  [/^row-span-full$/, () => ({ "grid-row": "1 / -1" })],
  [/^row-span-(\d+)$/, ([, n]) => (n ? { "grid-row": `span ${n} / span ${n}` } : undefined)],
  [/^row-start-auto$/, () => ({ "grid-row-start": "auto" })],
  [/^(-?)row-start-(\d+)$/, ([, neg, n]) => (n ? { "grid-row-start": `${neg ?? ""}${n}` } : undefined)],
  [/^row-end-auto$/, () => ({ "grid-row-end": "auto" })],
  [/^(-?)row-end-(\d+)$/, ([, neg, n]) => (n ? { "grid-row-end": `${neg ?? ""}${n}` } : undefined)],
];
