import { rem } from "../../../helpers.ts";
import type { Rule } from "../../../types.ts";

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

// padding utilities. positive values only (no auto, no negative — CSS spec).
export const paddingRules: Rule[] = [
  [
    /^(p[xylrtb]?)-(\d+(?:\.\d+)?|\.\d+)$/,
    ([, key, num]) => {
      const prop = props[key ?? ""];
      return prop && num ? { [prop]: rem(num) } : undefined;
    },
  ],
];
