import type { Rule } from "../../../types.ts";
import { withMeta } from "../with-meta.ts";

// flex-wrap — https://tailwindcss.com/docs/flex-wrap
// class suffix equals the CSS value (wrap / wrap-reverse / nowrap); `wrap-reverse` first so
// it wins over the `wrap` alternative.
export const flexWrapRules: Rule[] = withMeta(
  [[/^flex-(wrap-reverse|wrap|nowrap)$/, ([, v]) => ({ "flex-wrap": v ?? "" })]],
  { label: "flex-wrap", category: "flexbox-grid", tags: ["preset"] },
);
