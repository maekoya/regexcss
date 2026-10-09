import type { Rule } from "../../../types.ts";
import { withMeta } from "../../shared/with-meta.ts";

// grid-column — https://tailwindcss.com/docs/grid-column
// Covers the `grid-column` shorthand plus `grid-column-start` / `grid-column-end`.
// Numeric line utilities are dynamic; negatives use the unified `(-?)` capture.

export interface GridColumnOptions {
  /** Largest span / line number accepted, inclusive (default 12). Out-of-range values match no rule. */
  max?: number;
}

export const createGridColumnRules = ({ max = 12 }: GridColumnOptions = {}): Rule[] =>
  withMeta(
    [
      // col-auto, col-span-full are finite; docs enumerate them from the regex.
      [/^col-auto$/, () => ({ "grid-column": "auto" })],
      [/^col-span-full$/, () => ({ "grid-column": "1 / -1" })],
      [
        /^col-span-(\d+)$/,
        ([, n]) => (n && Number(n) <= max ? { "grid-column": `span ${n} / span ${n}` } : undefined),
        { samples: [{ class: "col-span-<num>", style: "grid-column: span <num> / span <num>;" }] },
      ],
      [
        /^(-?)col-(\d+)$/,
        ([, neg, n]) => (n && Number(n) <= max ? { "grid-column": `${neg ?? ""}${n}` } : undefined),
        {
          samples: [
            { class: "col-<num>", style: "grid-column: <num>;" },
            { class: "-col-<num>", style: "grid-column: -<num>;" },
          ],
        },
      ],
      [/^col-start-auto$/, () => ({ "grid-column-start": "auto" })],
      [
        /^(-?)col-start-(\d+)$/,
        ([, neg, n]) => (n && Number(n) <= max ? { "grid-column-start": `${neg ?? ""}${n}` } : undefined),
        {
          samples: [
            { class: "col-start-<num>", style: "grid-column-start: <num>;" },
            { class: "-col-start-<num>", style: "grid-column-start: -<num>;" },
          ],
        },
      ],
      [/^col-end-auto$/, () => ({ "grid-column-end": "auto" })],
      [
        /^(-?)col-end-(\d+)$/,
        ([, neg, n]) => (n && Number(n) <= max ? { "grid-column-end": `${neg ?? ""}${n}` } : undefined),
        {
          samples: [
            { class: "col-end-<num>", style: "grid-column-end: <num>;" },
            { class: "-col-end-<num>", style: "grid-column-end: -<num>;" },
          ],
        },
      ],
    ],
    { label: "grid-column", category: "flexbox-grid", tags: ["preset", "tailwind"] },
  );
