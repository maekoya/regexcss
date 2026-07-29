import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { createFlexGrowRules } from "./flex-grow.ts";

const flexGrowRules = createFlexGrowRules();

describe("flex-grow", () => {
  it.each([
    ["grow", "1"],
    ["grow-0", "0"],
    ["grow-3", "3"],
    ["grow-12", "12"],
  ])("%s -> flex-grow: %s", (token, value) => {
    expect(match(token, flexGrowRules)).toEqual({ "flex-grow": value });
  });

  it.each(["grow-", "grow-1.5", "-grow-1", "grow-auto", "growing"])("rejects %j", (token) => {
    expect(match(token, flexGrowRules)).toBeUndefined();
  });

  it("rejects values above the default cap and supports a custom cap via the factory", () => {
    expect(match("grow-13", flexGrowRules)).toBeUndefined();
    const grow = createFlexGrowRules({ max: 20 });
    expect(match("grow-20", grow)).toEqual({ "flex-grow": "20" });
    expect(match("grow-21", grow)).toBeUndefined();
  });
});
