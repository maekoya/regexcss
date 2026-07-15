import type { Rule } from "../../../types.ts";
import { withMeta } from "../../shared/with-meta.ts";

// justify-self — https://tailwindcss.com/docs/justify-self
export const justifySelfRules: Rule[] = withMeta(
  [[/^justify-self-(auto|start|end|center|stretch)$/, ([, v]) => ({ "justify-self": v ?? "" })]],
  { label: "justify-self", category: "flexbox-grid", tags: ["preset", "tailwind"] },
);
