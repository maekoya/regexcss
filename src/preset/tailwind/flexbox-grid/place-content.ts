import type { Rule } from "../../../types.ts";
import { withMeta } from "../../shared/with-meta.ts";

// place-content — https://tailwindcss.com/docs/place-content
const PLACE_CONTENT: Record<string, string> = {
  center: "center",
  start: "start",
  end: "end",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly",
  baseline: "baseline",
  stretch: "stretch",
};

export const placeContentRules: Rule[] = withMeta(
  [
    [
      /^place-content-(center|start|end|between|around|evenly|baseline|stretch)$/,
      ([, k]) => ({ "place-content": PLACE_CONTENT[k ?? ""] ?? "" }),
    ],
  ],
  { label: "place-content", category: "flexbox-grid", tags: ["preset", "tailwind"] },
);
