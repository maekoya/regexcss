import type { Rule } from "../../../types.ts";
import { withMeta } from "../../shared/with-meta.ts";

// flex-shrink — https://tailwindcss.com/docs/flex-shrink

export interface FlexShrinkOptions {
  /** Largest `shrink-<num>` value accepted, inclusive (default 12). Out-of-range values match no rule. */
  max?: number;
}

export const createFlexShrinkRules = ({ max = 12 }: FlexShrinkOptions = {}): Rule[] =>
  withMeta(
    [
      [/^shrink$/, () => ({ "flex-shrink": "1" })],
      [
        /^shrink-(\d+)$/,
        ([, n]) => (n && Number(n) <= max ? { "flex-shrink": n } : undefined),
        { samples: [{ class: "shrink-<num>", style: "flex-shrink: <num>;" }] },
      ],
    ],
    { label: "flex-shrink", category: "flexbox-grid", tags: ["preset", "tailwind"] },
  );
