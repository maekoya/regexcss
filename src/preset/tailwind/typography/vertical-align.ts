import type { Rule } from "../../../types.ts";
import { withMeta } from "../../shared/with-meta.ts";

// vertical-align — https://tailwindcss.com/docs/vertical-align
export const verticalAlignRules: Rule[] = withMeta(
  [[/^align-(baseline|text-top|text-bottom|top|middle|bottom|sub|super)$/, ([, v]) => ({ "vertical-align": v ?? "" })]],
  { label: "vertical-align", category: "typography", tags: ["preset"] },
);
