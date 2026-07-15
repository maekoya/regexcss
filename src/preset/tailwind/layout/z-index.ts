import type { Rule } from "../../../types.ts";
import { withMeta } from "../../shared/with-meta.ts";

// z-index — https://tailwindcss.com/docs/z-index
// Tailwind ships a 0/10/.../50 scale; we accept any integer (and negatives) up to `max`.

export interface ZIndexOptions {
  /** Largest z-index value accepted, inclusive (default 50). Out-of-range values match no rule. */
  max?: number;
}

export const createZIndexRules = ({ max = 10 }: ZIndexOptions = {}): Rule[] =>
  withMeta(
    [
      [/^z-auto$/, () => ({ "z-index": "auto" })],
      [
        /^(-?)z-(\d+)$/,
        ([, neg, n]) => (n && Number(n) <= max ? { "z-index": `${neg ?? ""}${n}` } : undefined),
        {
          samples: [
            { class: "z-<num>", style: "z-index: <num>;" },
            { class: "-z-<num>", style: "z-index: -<num>;" },
          ],
        },
      ],
    ],
    { label: "z-index", category: "layout", tags: ["preset"] },
  );
