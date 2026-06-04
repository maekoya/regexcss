import type { Rule } from "../../../types.ts";

// align-self — https://tailwindcss.com/docs/align-self
const ALIGN_SELF: Record<string, string> = {
  auto: "auto",
  start: "flex-start",
  end: "flex-end",
  center: "center",
  stretch: "stretch",
  baseline: "baseline",
};

export const alignSelfRules: Rule[] = [
  [/^self-(auto|start|end|center|stretch|baseline)$/, ([, k]) => ({ "align-self": ALIGN_SELF[k ?? ""] ?? "" })],
];
