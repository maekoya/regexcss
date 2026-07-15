import type { Rule } from "../../../types.ts";
import { withMeta } from "../../shared/with-meta.ts";

// white-space — https://tailwindcss.com/docs/whitespace
export const whiteSpaceRules: Rule[] = withMeta(
  [[/^whitespace-(normal|nowrap|pre-line|pre-wrap|pre|break-spaces)$/, ([, v]) => ({ "white-space": v ?? "" })]],
  { label: "white-space", category: "typography", tags: ["preset", "tailwind"] },
);
