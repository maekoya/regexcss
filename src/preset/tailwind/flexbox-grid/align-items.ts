import type { Rule } from "../../../types.ts";
import { withMeta } from "../../shared/with-meta.ts";

// align-items — https://tailwindcss.com/docs/align-items
const ALIGN_ITEMS: Record<string, string> = {
  start: "flex-start",
  end: "flex-end",
  center: "center",
  baseline: "baseline",
  stretch: "stretch",
};

export const alignItemsRules: Rule[] = withMeta(
  [[/^items-(start|end|center|baseline|stretch)$/, ([, k]) => ({ "align-items": ALIGN_ITEMS[k ?? ""] ?? "" })]],
  { label: "align-items", category: "flexbox-grid", tags: ["preset", "tailwind"] },
);
