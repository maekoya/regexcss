import type { CSSEntries, CSSObject, Rule, RuleContext } from "../types.ts";

export interface RuleMatch {
  css: CSSObject | CSSEntries;
  /** Index of the matched rule in `rules` — used to keep output in rule definition order. */
  index: number;
}

export const matchRule = (matcher: string, rules: Rule[], ctx: RuleContext): RuleMatch | undefined => {
  for (const [index, [re, handler]] of rules.entries()) {
    const m = matcher.match(re);
    if (!m) continue;
    const result = handler(m, ctx);
    if (result) return { css: result, index };
  }
  return undefined;
};
