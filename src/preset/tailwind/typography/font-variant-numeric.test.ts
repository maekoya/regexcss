import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { fontVariantNumericRules } from "./font-variant-numeric.ts";

describe("font-variant-numeric", () => {
  it.each([
    ["normal-nums", "normal"],
    ["ordinal", "ordinal"],
    ["slashed-zero", "slashed-zero"],
    ["lining-nums", "lining-nums"],
    ["oldstyle-nums", "oldstyle-nums"],
    ["proportional-nums", "proportional-nums"],
    ["tabular-nums", "tabular-nums"],
    ["diagonal-fractions", "diagonal-fractions"],
    ["stacked-fractions", "stacked-fractions"],
  ])("%j -> font-variant-numeric: %j", (token, value) => {
    expect(match(token, fontVariantNumericRules)).toEqual({ "font-variant-numeric": value });
  });

  it.each(["nums", "fractions", "tabular", "tabular-nums2"])("rejects %j", (token) => {
    expect(match(token, fontVariantNumericRules)).toBeUndefined();
  });
});
