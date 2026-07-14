import type { Rule } from "../../../types.ts";
import { withMeta } from "../../shared/with-meta.ts";

// order — https://tailwindcss.com/docs/order
const KEYWORDS: Record<string, string> = {
  first: "calc(-infinity)",
  last: "calc(infinity)",
  none: "0",
};

export interface OrderOptions {
  /** Largest order value accepted, inclusive (default 12). Out-of-range values match no rule. */
  max?: number;
}

export const createOrderRules = ({ max = 12 }: OrderOptions = {}): Rule[] =>
  withMeta(
    [
      // order-first / order-last / order-none are finite; docs enumerate them from the regex.
      [/^order-(first|last|none)$/, ([, k]) => ({ order: KEYWORDS[k ?? ""] ?? "" })],
      [
        /^(-?)order-(\d+)$/,
        ([, neg, n]) => (n && Number(n) <= max ? { order: `${neg ?? ""}${n}` } : undefined),
        {
          samples: [
            { class: "order-<num>", style: "order: <num>;" },
            { class: "-order-<num>", style: "order: -<num>;" },
          ],
        },
      ],
    ],
    { label: "order", category: "flexbox-grid", tags: ["preset"] },
  );

export const orderRules: Rule[] = createOrderRules();
