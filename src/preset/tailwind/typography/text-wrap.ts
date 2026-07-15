import type { Rule } from "../../../types.ts";
import { withMeta } from "../../shared/with-meta.ts";

// text-wrap — https://tailwindcss.com/docs/text-wrap
export const textWrapRules: Rule[] = withMeta(
  [[/^text-(wrap|nowrap|balance|pretty)$/, ([, v]) => ({ "text-wrap": v ?? "" })]],
  { label: "text-wrap", category: "typography", tags: ["preset"] },
);
