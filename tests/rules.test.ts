import { describe, expect, it } from "vitest";
import { matchRule } from "../src/core/rules.ts";
import type { Rule, RuleContext } from "../src/types.ts";

const ctx: RuleContext = {
  rawSelector: "m-1",
  currentSelector: "m-1",
  variants: [],
};

describe("matchRule", () => {
  it("returns the CSSObject and rule index when the regex matches", () => {
    const rules: Rule[] = [[/^m-([.\d]+)$/, ([, num]) => ({ margin: `${num}px` })]];
    expect(matchRule("m-1", rules, ctx)).toEqual({ css: { margin: "1px" }, index: 0 });
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
    expect(matchRule("m-1", rules, ctx)).toEqual({ css: { margin: "1px" }, index: 0 });
  });

  it("falls through when the first handler returns undefined", () => {
    const rules: Rule[] = [
      [/^m-(\d+)$/, () => undefined],
      [/^m-(\d+)$/, ([, num]) => ({ margin: `${num}rem` })],
    ];
    expect(matchRule("m-1", rules, ctx)).toEqual({ css: { margin: "1rem" }, index: 1 });
  });

  it("supports CSSEntries results (duplicate properties for fallbacks)", () => {
    const rules: Rule[] = [
      [
        /^stack$/,
        () => [
          ["display", "-webkit-box"],
          ["display", "flex"],
        ],
      ],
    ];
    expect(matchRule("stack", rules, ctx)).toEqual({
      css: [
        ["display", "-webkit-box"],
        ["display", "flex"],
      ],
      index: 0,
    });
  });
});
