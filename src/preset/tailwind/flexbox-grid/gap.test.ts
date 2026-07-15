import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { createGapRules } from "./gap.ts";

const gapRules = createGapRules();

describe("gap", () => {
  it("resolves gap, column-gap and row-gap", () => {
    expect(match("gap-4", gapRules)).toEqual({ gap: "1rem" });
    expect(match("gap-x-2", gapRules)).toEqual({ "column-gap": "0.5rem" });
    expect(match("gap-y-1.5", gapRules)).toEqual({ "row-gap": "0.375rem" });
  });

  it("rejects malformed tokens (would emit NaNrem)", () => {
    expect(match("gap-z-2", gapRules)).toBeUndefined();
    expect(match("gap-x-", gapRules)).toBeUndefined();
    expect(match("gap-.", gapRules)).toBeUndefined();
  });

  it("accepts integers up to the default cap of 96, rejects above", () => {
    expect(match("gap-2", gapRules)).toEqual({ gap: "0.5rem" });
    expect(match("gap-96", gapRules)).toEqual({ gap: "24rem" });
    expect(match("gap-97", gapRules)).toBeUndefined();
  });
});
