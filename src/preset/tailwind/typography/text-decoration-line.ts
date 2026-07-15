import type { Rule } from "../../../types.ts";
import { withMeta } from "../../shared/with-meta.ts";

// text-decoration-line — https://tailwindcss.com/docs/text-decoration-line
const VALUES: Record<string, string> = {
  underline: "underline",
  overline: "overline",
  "line-through": "line-through",
  "no-underline": "none",
};

export const textDecorationLineRules: Rule[] = withMeta(
  [
    [
      /^(line-through|no-underline|underline|overline)$/,
      ([, k]) => ({ "text-decoration-line": VALUES[k ?? ""] ?? "" }),
    ],
  ],
  { label: "text-decoration-line", category: "typography", tags: ["preset", "tailwind"] },
);
