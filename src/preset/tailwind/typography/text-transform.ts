import type { Rule } from "../../../types.ts";
import { withMeta } from "../../shared/with-meta.ts";

// text-transform — https://tailwindcss.com/docs/text-transform
const VALUES: Record<string, string> = {
  uppercase: "uppercase",
  lowercase: "lowercase",
  capitalize: "capitalize",
  "normal-case": "none",
};

export const textTransformRules: Rule[] = withMeta(
  [[/^(uppercase|lowercase|capitalize|normal-case)$/, ([, k]) => ({ "text-transform": VALUES[k ?? ""] ?? "" })]],
  { label: "text-transform", category: "typography", tags: ["preset"] },
);
