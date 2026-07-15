import type { Rule } from "../../../types.ts";
import { withMeta } from "../../shared/with-meta.ts";

// grid-template-rows — https://tailwindcss.com/docs/grid-template-rows
const KEYWORDS: Record<string, string> = {
  none: "none",
  subgrid: "subgrid",
};

export interface GridTemplateRowsOptions {
  /** Largest row count accepted, inclusive (default 12). Out-of-range values match no rule. */
  max?: number;
}

export const createGridTemplateRowsRules = ({ max = 12 }: GridTemplateRowsOptions = {}): Rule[] =>
  withMeta(
    [
      // grid-rows-none / grid-rows-subgrid are finite; docs enumerate them from the regex.
      [/^grid-rows-(none|subgrid)$/, ([, k]) => ({ "grid-template-rows": KEYWORDS[k ?? ""] ?? "" })],
      [
        /^grid-rows-(\d+)$/,
        ([, n]) => (n && Number(n) <= max ? { "grid-template-rows": `repeat(${n}, minmax(0, 1fr))` } : undefined),
        { samples: [{ class: "grid-rows-<num>", style: "grid-template-rows: repeat(<num>, minmax(0, 1fr));" }] },
      ],
    ],
    { label: "grid-template-rows", category: "flexbox-grid", tags: ["preset"] },
  );