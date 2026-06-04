import { describe, expect, it } from "vitest";
import { matchRule } from "../src/core/rules.ts";
import { gapRules, marginRules, paddingRules } from "../src/preset/index.ts";
import type { RuleContext } from "../src/types.ts";

const ctx = (token: string): RuleContext => ({
  rawSelector: token,
  currentSelector: token,
  variants: [],
});

const match = (token: string, rules = paddingRules) => matchRule(token, rules, ctx(token));

describe("preset spacing numeric guard", () => {
  it("accepts integers and decimals (1 unit = 0.25rem)", () => {
    expect(match("p-1")).toEqual({ padding: "0.25rem" });
    expect(match("p-0.5")).toEqual({ padding: "0.125rem" });
    expect(match("p-.5")).toEqual({ padding: "0.125rem" });
  });

  it.each(["p-.", "p-..", "p-1.", "p-1.2.3", "p-"])("rejects the malformed token %j (would emit NaNrem)", (token) => {
    expect(match(token)).toBeUndefined();
  });

  it("guards margin (incl. negative) and gap the same way", () => {
    expect(match("m-.", marginRules)).toBeUndefined();
    expect(match("-m-.", marginRules)).toBeUndefined();
    expect(match("gap-.", gapRules)).toBeUndefined();

    // valid tokens still resolve
    expect(match("m-2", marginRules)).toEqual({ margin: "0.5rem" });
    expect(match("-m-2", marginRules)).toEqual({ margin: "-0.5rem" });
    expect(match("gap-2", gapRules)).toEqual({ gap: "0.5rem" });
  });
});
