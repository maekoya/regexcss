import { rem } from "../../../helpers.ts";
import type { Rule } from "../../../types.ts";
import { scaleSamples } from "../../shared/scale-samples.ts";
import { withMeta } from "../../shared/with-meta.ts";

// margin — https://tailwindcss.com/docs/margin
const props: Record<string, string> = {
  m: "margin",
  mx: "margin-inline",
  my: "margin-block",
  ml: "margin-left",
  mr: "margin-right",
  mt: "margin-top",
  mb: "margin-bottom",
};

// one docs sample per key, e.g. { class: "mt-<num>", style: "margin-top: <num/4>rem;" }
const numericSamples = (sign: "" | "-") => scaleSamples(props, (key) => `${sign}${key}-<num>`, `${sign}<num/4>rem`);

export interface MarginOptions {
  /** Largest value the numeric scale accepts, inclusive (default 96). Out-of-range values match no rule. */
  max?: number;
}

// margin utilities. supports positive (m-1), negative (-m-1), and auto (m-auto).
export const createMarginRules = ({ max = 96 }: MarginOptions = {}): Rule[] =>
  withMeta(
    [
      [
        /^(m[xylrtb]?)-(\d+(?:\.\d+)?|\.\d+)$/,
        ([, key, num]) => {
          const prop = props[key ?? ""];
          return prop && num && Number(num) <= max ? { [prop]: rem(num) } : undefined;
        },
        { samples: numericSamples("") },
      ],
      [
        /^-(m[xylrtb]?)-(\d+(?:\.\d+)?|\.\d+)$/,
        ([, key, num]) => {
          const prop = props[key ?? ""];
          return prop && num && Number(num) <= max ? { [prop]: `-${rem(num)}` } : undefined;
        },
        { samples: numericSamples("-") },
      ],
      // m-auto, mx-auto, ... are finite; docs enumerate them straight from the regex.
      [
        /^(m[xylrtb]?)-auto$/,
        ([, key]) => {
          const prop = props[key ?? ""];
          return prop ? { [prop]: "auto" } : undefined;
        },
      ],
    ],
    { label: "margin", category: "spacing", tags: ["preset"] },
  );