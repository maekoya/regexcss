import type { Rule } from "../../../types.ts";
import { withMeta } from "../../shared/with-meta.ts";

// overscroll-behavior — https://tailwindcss.com/docs/overscroll-behavior
const props: Record<string, string> = {
  "": "overscroll-behavior",
  x: "overscroll-behavior-x",
  y: "overscroll-behavior-y",
};

export const overscrollRules: Rule[] = withMeta(
  [
    [
      /^overscroll(?:-([xy]))?-(auto|contain|none)$/,
      ([, dir, v]) => {
        const prop = props[dir ?? ""];
        return prop && v ? { [prop]: v } : undefined;
      },
    ],
  ],
  { label: "overscroll-behavior", category: "layout", tags: ["preset"] },
);
