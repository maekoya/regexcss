import type { Rule } from "../../../types.ts";

// line-clamp — https://tailwindcss.com/docs/line-clamp
export const lineClampRules: Rule[] = [
  [
    /^line-clamp-(\d+)$/,
    ([, n]) => ({
      overflow: "hidden",
      display: "-webkit-box",
      "-webkit-box-orient": "vertical",
      "-webkit-line-clamp": n ?? "",
    }),
  ],
  [
    /^line-clamp-none$/,
    () => ({
      overflow: "visible",
      display: "block",
      "-webkit-box-orient": "horizontal",
      "-webkit-line-clamp": "none",
    }),
  ],
];
