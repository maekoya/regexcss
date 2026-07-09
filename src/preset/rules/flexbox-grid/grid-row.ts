import type { Rule } from "../../../types.ts";
import { withMeta } from "../with-meta.ts";

// grid-row — https://tailwindcss.com/docs/grid-row
// Covers the `grid-row` shorthand plus `grid-row-start` / `grid-row-end`.
// Numeric line utilities are dynamic; negatives use the unified `(-?)` capture.

export interface GridRowOptions {
  /** Largest span / line number accepted, inclusive (default 12). Out-of-range values match no rule. */
  max?: number;
}

export const createGridRowRules = ({ max = 12 }: GridRowOptions = {}): Rule[] =>
  withMeta(
    [
      // row-auto, row-span-full are finite; docs enumerate them from the regex.
      [/^row-auto$/, () => ({ "grid-row": "auto" })],
      [/^row-span-full$/, () => ({ "grid-row": "1 / -1" })],
      [
        /^row-span-(\d+)$/,
        ([, n]) => (n && Number(n) <= max ? { "grid-row": `span ${n} / span ${n}` } : undefined),
        { samples: [{ class: "row-span-<num>", style: "grid-row: span <num> / span <num>;" }] },
      ],
      [/^row-start-auto$/, () => ({ "grid-row-start": "auto" })],
      [
        /^(-?)row-start-(\d+)$/,
        ([, neg, n]) => (n && Number(n) <= max ? { "grid-row-start": `${neg ?? ""}${n}` } : undefined),
        {
          samples: [
            { class: "row-start-<num>", style: "grid-row-start: <num>;" },
            { class: "-row-start-<num>", style: "grid-row-start: -<num>;" },
          ],
        },
      ],
      [/^row-end-auto$/, () => ({ "grid-row-end": "auto" })],
      [
        /^(-?)row-end-(\d+)$/,
        ([, neg, n]) => (n && Number(n) <= max ? { "grid-row-end": `${neg ?? ""}${n}` } : undefined),
        {
          samples: [
            { class: "row-end-<num>", style: "grid-row-end: <num>;" },
            { class: "-row-end-<num>", style: "grid-row-end: -<num>;" },
          ],
        },
      ],
    ],
    { label: "grid-row", category: "flexbox-grid", tags: ["preset"] },
  );

export const gridRowRules: Rule[] = createGridRowRules();
