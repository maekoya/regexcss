import type { Rule } from "../../../types.ts";
import { withMeta } from "../with-meta.ts";

// text-overflow — https://tailwindcss.com/docs/text-overflow
export const textOverflowRules: Rule[] = withMeta(
  [
    [/^truncate$/, () => ({ overflow: "hidden", "text-overflow": "ellipsis", "white-space": "nowrap" })],
    [/^text-(ellipsis|clip)$/, ([, v]) => ({ "text-overflow": v ?? "" })],
  ],
  { label: "text-overflow", category: "typography", tags: ["preset"] },
);
