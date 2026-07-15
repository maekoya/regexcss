import type { Rule } from "../../../types.ts";
import { withMeta } from "../../shared/with-meta.ts";

// justify-items — https://tailwindcss.com/docs/justify-items
export const justifyItemsRules: Rule[] = withMeta(
  [[/^justify-items-(normal|start|end|center|stretch)$/, ([, v]) => ({ "justify-items": v ?? "" })]],
  { label: "justify-items", category: "flexbox-grid", tags: ["preset", "tailwind"] },
);
