import { describe, expect, it } from "vitest";
import { createGapRules } from "../src/preset/tailwind/flexbox-grid/gap.ts";
import { tailwindPreset } from "../src/preset/tailwind/index.ts";
import type { SpacingOptions } from "../src/preset/tailwind/spacing/index.ts";
import { createMarginRules } from "../src/preset/tailwind/spacing/margin.ts";
import { createPaddingRules } from "../src/preset/tailwind/spacing/padding.ts";
import { match as matchIn } from "./preset-helpers.ts";

const gapRules = createGapRules();
const marginRules = createMarginRules();
const paddingRules = createPaddingRules();

// the category-wide cap lives behind tailwindPreset's options
const createSpacingRules = (options?: SpacingOptions) =>
  tailwindPreset({ include: ["spacing"], options: { spacing: options } });

const match = (token: string, rules = paddingRules) => matchIn(token, rules);

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

describe("preset spacing numeric cap", () => {
  it("accepts values up to the default cap of 96", () => {
    expect(match("p-96")).toEqual({ padding: "24rem" });
    expect(match("m-96", marginRules)).toEqual({ margin: "24rem" });
    expect(match("-m-96", marginRules)).toEqual({ margin: "-24rem" });
    expect(match("gap-96", gapRules)).toEqual({ gap: "24rem" });
  });

  it("rejects values above the default cap", () => {
    expect(match("p-97")).toBeUndefined();
    expect(match("m-97", marginRules)).toBeUndefined();
    expect(match("-m-97", marginRules)).toBeUndefined();
    expect(match("gap-97", gapRules)).toBeUndefined();
    expect(match("m-96.5", marginRules)).toBeUndefined();
  });

  it("supports a custom cap via the factories", () => {
    const margin = createMarginRules({ max: 4 });
    expect(match("m-4", margin)).toEqual({ margin: "1rem" });
    expect(match("m-5", margin)).toBeUndefined();

    const spacing = createSpacingRules({ max: 8 });
    expect(match("p-8", spacing)).toEqual({ padding: "2rem" });
    expect(match("p-9", spacing)).toBeUndefined();
    expect(match("m-9", spacing)).toBeUndefined();
  });
});
