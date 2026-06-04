import { rem } from "../../../helpers.ts";
import type { Rule } from "../../../types.ts";

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

// margin utilities. supports positive (m-1), negative (-m-1), and auto (m-auto).
export const marginRules: Rule[] = [
  [
    /^(m[xylrtb]?)-(\d+(?:\.\d+)?|\.\d+)$/,
    ([, key, num]) => {
      const prop = props[key ?? ""];
      return prop && num ? { [prop]: rem(num) } : undefined;
    },
  ],
  [
    /^-(m[xylrtb]?)-(\d+(?:\.\d+)?|\.\d+)$/,
    ([, key, num]) => {
      const prop = props[key ?? ""];
      return prop && num ? { [prop]: `-${rem(num)}` } : undefined;
    },
  ],
  [
    /^(m[xylrtb]?)-auto$/,
    ([, key]) => {
      const prop = props[key ?? ""];
      return prop ? { [prop]: "auto" } : undefined;
    },
  ],
];
