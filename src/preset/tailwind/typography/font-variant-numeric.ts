import type { Rule } from "../../../types.ts";
import { withMeta } from "../../shared/with-meta.ts";

// font-variant-numeric — https://tailwindcss.com/docs/font-variant-numeric
// Tailwind composes these via CSS vars so they can stack (e.g. `ordinal tabular-nums`);
// here each maps directly to a single value.
const VALUES: Record<string, string> = {
  "normal-nums": "normal",
  ordinal: "ordinal",
  "slashed-zero": "slashed-zero",
  "lining-nums": "lining-nums",
  "oldstyle-nums": "oldstyle-nums",
  "proportional-nums": "proportional-nums",
  "tabular-nums": "tabular-nums",
  "diagonal-fractions": "diagonal-fractions",
  "stacked-fractions": "stacked-fractions",
};

export const fontVariantNumericRules: Rule[] = withMeta(
  [
    [
      /^(normal-nums|ordinal|slashed-zero|lining-nums|oldstyle-nums|proportional-nums|tabular-nums|diagonal-fractions|stacked-fractions)$/,
      ([, k]) => ({ "font-variant-numeric": VALUES[k ?? ""] ?? "" }),
    ],
  ],
  { label: "font-variant-numeric", category: "typography", tags: ["preset"] },
);
