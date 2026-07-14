import type { Rule } from "../../../types.ts";
import { withMeta } from "../../shared/with-meta.ts";

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

export const fontWeightRules: Rule[] = withMeta(
  [
    [
      /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/,
      ([, k]) => ({ "font-weight": FONT_WEIGHT[k ?? ""] ?? "" }),
    ],
  ],
  { label: "font-weight", category: "typography", tags: ["preset"] },
);
