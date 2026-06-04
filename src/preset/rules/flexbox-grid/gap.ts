import { rem } from "../../../helpers.ts";
import type { Rule } from "../../../types.ts";

// gap — https://tailwindcss.com/docs/gap
const props: Record<string, string> = {
  "": "gap",
  x: "column-gap",
  y: "row-gap",
};

export const gapRules: Rule[] = [
  [
    /^gap(?:-([xy]))?-(\d+(?:\.\d+)?|\.\d+)$/,
    ([, dir, num]) => {
      const prop = props[dir ?? ""];
      return prop && num ? { [prop]: rem(num) } : undefined;
    },
  ],
];
