import type { Rule } from "../../../types.ts";
import { withMeta } from "../../shared/with-meta.ts";

// place-self — https://tailwindcss.com/docs/place-self
export const placeSelfRules: Rule[] = withMeta(
  [[/^place-self-(auto|start|end|center|stretch)$/, ([, v]) => ({ "place-self": v ?? "" })]],
  { label: "place-self", category: "flexbox-grid", tags: ["preset", "tailwind"] },
);
