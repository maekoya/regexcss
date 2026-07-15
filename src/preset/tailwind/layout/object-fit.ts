import type { Rule } from "../../../types.ts";
import { withMeta } from "../../shared/with-meta.ts";

// object-fit — https://tailwindcss.com/docs/object-fit
export const objectFitRules: Rule[] = withMeta(
  [[/^object-(contain|cover|fill|none|scale-down)$/, ([, v]) => ({ "object-fit": v ?? "" })]],
  { label: "object-fit", category: "layout", tags: ["preset"] },
);
