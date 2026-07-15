import type { Rule } from "../../../types.ts";
import { withMeta } from "../../shared/with-meta.ts";

// word-break — https://tailwindcss.com/docs/word-break
const WORD_BREAK: Record<string, string> = {
  normal: "normal",
  all: "break-all",
  keep: "keep-all",
};

export const wordBreakRules: Rule[] = withMeta(
  [[/^break-(normal|all|keep)$/, ([, k]) => ({ "word-break": WORD_BREAK[k ?? ""] ?? "" })]],
  { label: "word-break", category: "typography", tags: ["preset"] },
);
