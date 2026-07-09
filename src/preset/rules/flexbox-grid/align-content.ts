import type { Rule } from "../../../types.ts";
import { withMeta } from "../with-meta.ts";

// align-content — https://tailwindcss.com/docs/align-content
const ALIGN_CONTENT: Record<string, string> = {
  normal: "normal",
  center: "center",
  start: "flex-start",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly",
  baseline: "baseline",
  stretch: "stretch",
};

export const alignContentRules: Rule[] = withMeta(
  [
    [
      /^content-(normal|center|start|end|between|around|evenly|baseline|stretch)$/,
      ([, k]) => ({ "align-content": ALIGN_CONTENT[k ?? ""] ?? "" }),
    ],
  ],
  { label: "align-content", category: "flexbox-grid", tags: ["preset"] },
);
