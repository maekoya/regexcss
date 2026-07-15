import { rem } from "../../../helpers.ts";
import type { Rule } from "../../../types.ts";
import { scaleSamples } from "../../shared/scale-samples.ts";
import { withMeta } from "../../shared/with-meta.ts";

// gap — https://tailwindcss.com/docs/gap
const props: Record<string, string> = {
  "": "gap",
  x: "column-gap",
  y: "row-gap",
};

// one docs sample per direction: gap-<num>, gap-x-<num>, gap-y-<num>
const numericSamples = scaleSamples(props, (dir) => (dir ? `gap-${dir}-<num>` : "gap-<num>"));

export interface GapOptions {
  /** Largest value the numeric scale accepts, inclusive (default 96). Out-of-range values match no rule. */
  max?: number;
}

export const createGapRules = ({ max = 96 }: GapOptions = {}): Rule[] =>
  withMeta(
    [
      [
        /^gap(?:-([xy]))?-(\d+(?:\.\d+)?|\.\d+)$/,
        ([, dir, num]) => {
          const prop = props[dir ?? ""];
          return prop && num && Number(num) <= max ? { [prop]: rem(num) } : undefined;
        },
        { samples: numericSamples },
      ],
    ],
    { label: "gap", category: "flexbox-grid", tags: ["preset"] },
  );