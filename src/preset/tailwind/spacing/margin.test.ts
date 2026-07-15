import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { createMarginRules } from "./margin.ts";

const marginRules = createMarginRules();

describe("margin numeric guard", () => {
  it("accepts integers and decimals, positive and negative", () => {
    expect(match("m-2", marginRules)).toEqual({ margin: "0.5rem" });
    expect(match("-m-2", marginRules)).toEqual({ margin: "-0.5rem" });
  });

  it("rejects malformed tokens (would emit NaNrem)", () => {
    expect(match("m-.", marginRules)).toBeUndefined();
    expect(match("-m-.", marginRules)).toBeUndefined();
  });
});

describe("margin numeric cap", () => {
  it("accepts values up to the default cap of 96, positive and negative", () => {
    expect(match("m-96", marginRules)).toEqual({ margin: "24rem" });
    expect(match("-m-96", marginRules)).toEqual({ margin: "-24rem" });
  });

  it("rejects values above the default cap", () => {
    expect(match("m-97", marginRules)).toBeUndefined();
    expect(match("-m-97", marginRules)).toBeUndefined();
    expect(match("m-96.5", marginRules)).toBeUndefined();
  });

  it("supports a custom cap via the factory", () => {
    const margin = createMarginRules({ max: 4 });
    expect(match("m-4", margin)).toEqual({ margin: "1rem" });
    expect(match("m-5", margin)).toBeUndefined();
  });
});

describe("margin — excludeNegativeClasses", () => {
  it("drops the negative-margin rules via the factory, keeping positive and auto", () => {
    const rules = createMarginRules({ excludeNegativeClasses: true });
    expect(match("-m-2", rules)).toBeUndefined();
    expect(match("-mx-4", rules)).toBeUndefined();
    expect(match("m-2", rules)).toEqual({ margin: "0.5rem" });
    expect(match("m-auto", rules)).toEqual({ margin: "auto" });
  });
});
