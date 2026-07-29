import type { Rule } from "../../../types.ts";
import { withMeta } from "../../shared/with-meta.ts";

// place-items — https://tailwindcss.com/docs/place-items
export const placeItemsRules: Rule[] = withMeta(
  [[/^place-items-(start|end|center|baseline|stretch)$/, ([, v]) => ({ "place-items": v ?? "" })]],
  { label: "place-items", category: "flexbox-grid", tags: ["preset", "tailwind"] },
);
