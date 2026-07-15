import { rem } from "../../../helpers.ts";
import type { Rule } from "../../../types.ts";
import { scaleSamples } from "../../shared/scale-samples.ts";
import { withMeta } from "../../shared/with-meta.ts";

// padding — https://tailwindcss.com/docs/padding
const props: Record<string, string> = {
  p: "padding",
  px: "padding-inline",
  py: "padding-block",
  pl: "padding-left",
  pr: "padding-right",
  pt: "padding-top",
  pb: "padding-bottom",
};

// one docs sample per key, e.g. { class: "pt-<num>", style: "padding-top: <num/4>rem;" }
const numericSamples = scaleSamples(props, (key) => `${key}-<num>`);

export interface PaddingOptions {
  /** Largest value the numeric scale accepts, inclusive (default 96). Out-of-range values match no rule. */
  max?: number;
}

// padding utilities. positive values only (no auto, no negative — CSS spec).
export const createPaddingRules = ({ max = 96 }: PaddingOptions = {}): Rule[] =>
  withMeta(
    [
      [
        /^(p[xylrtb]?)-(\d+(?:\.\d+)?|\.\d+)$/,
        ([, key, num]) => {
          const prop = props[key ?? ""];
          return prop && num && Number(num) <= max ? { [prop]: rem(num) } : undefined;
        },
        { samples: numericSamples },
      ],
    ],
    { label: "padding", category: "spacing", tags: ["preset"] },
  );