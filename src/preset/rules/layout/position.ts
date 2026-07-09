import type { Rule } from "../../../types.ts";
import { withMeta } from "../with-meta.ts";

// position — https://tailwindcss.com/docs/position
export const positionRules: Rule[] = withMeta(
  [[/^(static|fixed|absolute|relative|sticky)$/, ([, v]) => ({ position: v ?? "" })]],
  { label: "position", category: "layout", tags: ["preset"] },
);
