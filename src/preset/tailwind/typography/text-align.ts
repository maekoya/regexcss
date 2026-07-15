import type { Rule } from "../../../types.ts";
import { withMeta } from "../../shared/with-meta.ts";

// text-align — https://tailwindcss.com/docs/text-align
export const textAlignRules: Rule[] = withMeta(
  [[/^text-(left|center|right|justify)$/, ([, align]) => ({ "text-align": align ?? "" })]],
  { label: "text-align", category: "typography", tags: ["preset", "tailwind"] },
);
