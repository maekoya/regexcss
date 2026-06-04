import type { Rule } from "../../../types.ts";

// font-weight — https://tailwindcss.com/docs/font-weight
const FONT_WEIGHT: Record<string, string> = {
  thin: "100",
  extralight: "200",
  light: "300",
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
  black: "900",
};

export const fontWeightRules: Rule[] = [
  [
    /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/,
    ([, k]) => ({ "font-weight": FONT_WEIGHT[k ?? ""] ?? "" }),
  ],
];
