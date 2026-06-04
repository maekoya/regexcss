import type { Rule } from "../../../types.ts";

// text-decoration-line — https://tailwindcss.com/docs/text-decoration-line
const VALUES: Record<string, string> = {
  underline: "underline",
  overline: "overline",
  "line-through": "line-through",
  "no-underline": "none",
};

export const textDecorationLineRules: Rule[] = [
  [/^(line-through|no-underline|underline|overline)$/, ([, k]) => ({ "text-decoration-line": VALUES[k ?? ""] ?? "" })],
];
