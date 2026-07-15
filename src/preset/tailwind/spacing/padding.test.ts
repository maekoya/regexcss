import { describe, expect, it } from "vitest";
import { match as matchIn } from "../../test-helpers.ts";
import { createPaddingRules } from "./padding.ts";

const paddingRules = createPaddingRules();

const match = (token: string, rules = paddingRules) => matchIn(token, rules);

describe("padding numeric guard", () => {
  it("accepts integers and decimals (1 unit = 0.25rem)", () => {
    expect(match("p-1")).toEqual({ padding: "0.25rem" });
    expect(match("p-0.5")).toEqual({ padding: "0.125rem" });
    expect(match("p-.5")).toEqual({ padding: "0.125rem" });
  });

  it.each(["p-.", "p-..", "p-1.", "p-1.2.3", "p-"])("rejects the malformed token %j (would emit NaNrem)", (token) => {
    expect(match(token)).toBeUndefined();
  });
});

describe("padding numeric cap", () => {
  it("accepts values up to the default cap of 96", () => {
    expect(match("p-96")).toEqual({ padding: "24rem" });
  });

  it("rejects values above the default cap", () => {
    expect(match("p-97")).toBeUndefined();
  });
});
