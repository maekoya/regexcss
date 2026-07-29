import type { Rule } from "../../../types.ts";
import { withMeta } from "../../shared/with-meta.ts";

// flex — https://tailwindcss.com/docs/flex
const KEYWORDS: Record<string, string> = {
  auto: "auto",
  initial: "0 auto",
  none: "none",
};

// fractions accept numerator < denominator with denominators up to this bound
const FRACTION_MAX_DENOMINATOR = 12;

export interface FlexOptions {
  /** Largest `flex-<num>` value accepted, inclusive (default 12). Out-of-range values match no rule. */
  max?: number;
}

export const createFlexRules = ({ max = 12 }: FlexOptions = {}): Rule[] =>
  withMeta(
    [
      // flex-auto / flex-initial / flex-none are finite; docs enumerate them from the regex.
      [/^flex-(auto|initial|none)$/, ([, k]) => ({ flex: KEYWORDS[k ?? ""] ?? "" })],
      [
        /^flex-(\d+)$/,
        ([, n]) => (n && Number(n) <= max ? { flex: n } : undefined),
        { samples: [{ class: "flex-<num>", style: "flex: <num>;" }] },
      ],
      // fractions: flex-1/2 → flex: calc(1/2 * 100%)
      [
        /^flex-(\d+)\/(\d+)$/,
        ([, n, d]) =>
          n && d && Number(n) >= 1 && Number(n) < Number(d) && Number(d) <= FRACTION_MAX_DENOMINATOR
            ? { flex: `calc(${n}/${d} * 100%)` }
            : undefined,
        { samples: [{ class: "flex-<n>/<d>", style: "flex: calc(<n>/<d> * 100%);" }] },
      ],
    ],
    { label: "flex", category: "flexbox-grid", tags: ["preset", "tailwind"] },
  );
