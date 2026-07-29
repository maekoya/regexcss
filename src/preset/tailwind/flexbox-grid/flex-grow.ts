import type { Rule } from "../../../types.ts";
import { withMeta } from "../../shared/with-meta.ts";

// flex-grow — https://tailwindcss.com/docs/flex-grow

export interface FlexGrowOptions {
  /** Largest `grow-<num>` value accepted, inclusive (default 12). Out-of-range values match no rule. */
  max?: number;
}

export const createFlexGrowRules = ({ max = 12 }: FlexGrowOptions = {}): Rule[] =>
  withMeta(
    [
      [/^grow$/, () => ({ "flex-grow": "1" })],
      [
        /^grow-(\d+)$/,
        ([, n]) => (n && Number(n) <= max ? { "flex-grow": n } : undefined),
        { samples: [{ class: "grow-<num>", style: "flex-grow: <num>;" }] },
      ],
    ],
    { label: "flex-grow", category: "flexbox-grid", tags: ["preset", "tailwind"] },
  );
