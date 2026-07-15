import type { Rule } from "../../../types.ts";
import { withMeta } from "../../shared/with-meta.ts";

// grid-template-columns — https://tailwindcss.com/docs/grid-template-columns
const KEYWORDS: Record<string, string> = {
  none: "none",
  subgrid: "subgrid",
};

export interface GridTemplateColumnsOptions {
  /** Largest column count accepted, inclusive (default 12). Out-of-range values match no rule. */
  max?: number;
}

export const createGridTemplateColumnsRules = ({ max = 12 }: GridTemplateColumnsOptions = {}): Rule[] =>
  withMeta(
    [
      // grid-cols-none / grid-cols-subgrid are finite; docs enumerate them from the regex.
      [/^grid-cols-(none|subgrid)$/, ([, k]) => ({ "grid-template-columns": KEYWORDS[k ?? ""] ?? "" })],
      [
        /^grid-cols-(\d+)$/,
        ([, n]) => (n && Number(n) <= max ? { "grid-template-columns": `repeat(${n}, minmax(0, 1fr))` } : undefined),
        { samples: [{ class: "grid-cols-<num>", style: "grid-template-columns: repeat(<num>, minmax(0, 1fr));" }] },
      ],
    ],
    { label: "grid-template-columns", category: "flexbox-grid", tags: ["preset"] },
  );