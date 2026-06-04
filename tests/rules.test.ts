import { describe, expect, it } from "vitest";
import { matchRule } from "../src/core/rules.ts";
import type { Rule, RuleContext } from "../src/types.ts";

const ctx: RuleContext = {
  rawSelector: "m-1",
  currentSelector: "m-1",
  variants: [],
};

describe("matchRule", () => {
  it("returns CSSObject when the regex matches", () => {
    const rules: Rule[] = [[/^m-([.\d]+)$/, ([, num]) => ({ margin: `${num}px` })]];
    expect(matchRule("m-1", rules, ctx)).toEqual({ margin: "1px" });
  });

  it("returns undefined when no rule matches", () => {
    const rules: Rule[] = [[/^p-(\d+)$/, ([, num]) => ({ padding: `${num}px` })]];
    expect(matchRule("m-1", rules, ctx)).toBeUndefined();
  });

  it("uses the first matching rule (no fallthrough)", () => {
    const rules: Rule[] = [
      [/^m-(\d+)$/, ([, num]) => ({ margin: `${num}px` })],
      [/^m-(\d+)$/, ([, num]) => ({ margin: `${num}rem` })],
    ];
    expect(matchRule("m-1", rules, ctx)).toEqual({ margin: "1px" });
  });

  it("falls through when the first handler returns undefined", () => {
    const rules: Rule[] = [
      [/^m-(\d+)$/, () => undefined],
      [/^m-(\d+)$/, ([, num]) => ({ margin: `${num}rem` })],
    ];
    expect(matchRule("m-1", rules, ctx)).toEqual({ margin: "1rem" });
  });
});
