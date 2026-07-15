import { matchRule } from "../core/rules.ts";
import type { CSSObject, Rule, RuleContext } from "../types.ts";

/** A minimal RuleContext for matching a bare token (no variants). */
export const ctx = (token: string): RuleContext => ({
  rawSelector: token,
  currentSelector: token,
  variants: [],
});

/** Match a token against rules and return the generated declarations (or undefined). */
export const match = (token: string, rules: Rule[]): CSSObject | undefined =>
  matchRule(token, rules, ctx(token))?.css as CSSObject | undefined;
