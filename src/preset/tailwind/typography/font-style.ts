import type { Rule } from "../../../types.ts";
import { withMeta } from "../../shared/with-meta.ts";

// font-style — https://tailwindcss.com/docs/font-style
const VALUES: Record<string, string> = {
  italic: "italic",
  "not-italic": "normal",
};

export const fontStyleRules: Rule[] = withMeta(
  [[/^(not-italic|italic)$/, ([, k]) => ({ "font-style": VALUES[k ?? ""] ?? "" })]],
  { label: "font-style", category: "typography", tags: ["preset"] },
);
