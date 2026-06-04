import type { CSSObject, Rule, RuleContext } from "../types.ts";

export const matchRule = (matcher: string, rules: Rule[], ctx: RuleContext): CSSObject | undefined => {
  for (const [re, handler] of rules) {
    const m = matcher.match(re);
    if (!m) continue;
    const result = handler(m, ctx);
    if (result) return result;
  }
  return undefined;
};
