import type { Rule } from "../../../types.ts";

// font-style — https://tailwindcss.com/docs/font-style
const VALUES: Record<string, string> = {
  italic: "italic",
  "not-italic": "normal",
};

export const fontStyleRules: Rule[] = [[/^(not-italic|italic)$/, ([, k]) => ({ "font-style": VALUES[k ?? ""] ?? "" })]];
