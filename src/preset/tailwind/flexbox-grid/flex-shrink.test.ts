import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { createFlexShrinkRules } from "./flex-shrink.ts";

const flexShrinkRules = createFlexShrinkRules();

describe("flex-shrink", () => {
  it.each([
    ["shrink", "1"],
    ["shrink-0", "0"],
    ["shrink-3", "3"],
    ["shrink-12", "12"],
  ])("%s -> flex-shrink: %s", (token, value) => {
    expect(match(token, flexShrinkRules)).toEqual({ "flex-shrink": value });
  });

  it.each(["shrink-", "shrink-1.5", "-shrink-1", "shrink-auto", "shrinking"])("rejects %j", (token) => {
    expect(match(token, flexShrinkRules)).toBeUndefined();
  });

  it("rejects values above the default cap and supports a custom cap via the factory", () => {
    expect(match("shrink-13", flexShrinkRules)).toBeUndefined();
    const shrink = createFlexShrinkRules({ max: 20 });
    expect(match("shrink-20", shrink)).toEqual({ "flex-shrink": "20" });
    expect(match("shrink-21", shrink)).toBeUndefined();
  });
});
