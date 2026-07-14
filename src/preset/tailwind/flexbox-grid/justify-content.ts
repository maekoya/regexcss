import type { Rule } from "../../../types.ts";
import { withMeta } from "../../shared/with-meta.ts";

// justify-content — https://tailwindcss.com/docs/justify-content
const JUSTIFY_CONTENT: Record<string, string> = {
  normal: "normal",
  start: "flex-start",
  end: "flex-end",
  center: "center",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly",
  stretch: "stretch",
};

export const justifyContentRules: Rule[] = withMeta(
  [
    [
      /^justify-(normal|start|end|center|between|around|evenly|stretch)$/,
      ([, k]) => ({ "justify-content": JUSTIFY_CONTENT[k ?? ""] ?? "" }),
    ],
  ],
  { label: "justify-content", category: "flexbox-grid", tags: ["preset"] },
);
