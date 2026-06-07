import type { Rule } from "../../../types.ts";

// flex-wrap — https://tailwindcss.com/docs/flex-wrap
// class suffix equals the CSS value (wrap / wrap-reverse / nowrap); `wrap-reverse` first so
// it wins over the `wrap` alternative.
export const flexWrapRules: Rule[] = [[/^flex-(wrap-reverse|wrap|nowrap)$/, ([, v]) => ({ "flex-wrap": v ?? "" })]];
