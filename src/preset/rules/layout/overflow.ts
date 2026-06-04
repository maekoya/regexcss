import type { Rule } from "../../../types.ts";

// overflow — https://tailwindcss.com/docs/overflow
const props: Record<string, string> = {
  "": "overflow",
  x: "overflow-x",
  y: "overflow-y",
};

export const overflowRules: Rule[] = [
  [
    /^overflow(?:-([xy]))?-(auto|hidden|clip|visible|scroll)$/,
    ([, dir, v]) => {
      const prop = props[dir ?? ""];
      return prop && v ? { [prop]: v } : undefined;
    },
  ],
];
