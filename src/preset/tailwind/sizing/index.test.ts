import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { tailwindPreset } from "../index.ts";
import { createHeightRules } from "./height.ts";
import type { SizingOptions } from "./index.ts";
import { createMaxHeightRules } from "./max-height.ts";
import { createMaxWidthRules } from "./max-width.ts";
import { createMinHeightRules } from "./min-height.ts";
import { createMinWidthRules } from "./min-width.ts";
import { createSizeRules } from "./size.ts";
import { createWidthRules } from "./width.ts";

const heightRules = createHeightRules();
const maxHeightRules = createMaxHeightRules();
const maxWidthRules = createMaxWidthRules();
const minHeightRules = createMinHeightRules();
const minWidthRules = createMinWidthRules();
const sizeRules = createSizeRules();
const widthRules = createWidthRules();

// the category-wide cap lives behind tailwindPreset's options
const createSizingRules = (options?: SizingOptions) =>
  tailwindPreset({ include: ["sizing"], options: { sizing: options } });

describe("preset sizing — min/max", () => {
  it("min-width keeps auto, no none", () => {
    expect(match("min-w-0", minWidthRules)).toEqual({ "min-width": "0rem" });
    expect(match("min-w-full", minWidthRules)).toEqual({ "min-width": "100%" });
    expect(match("min-w-auto", minWidthRules)).toEqual({ "min-width": "auto" });
    expect(match("min-w-none", minWidthRules)).toBeUndefined();
  });

  it("max-width keeps none, no auto, and the container scale", () => {
    expect(match("max-w-none", maxWidthRules)).toEqual({ "max-width": "none" });
    expect(match("max-w-full", maxWidthRules)).toEqual({ "max-width": "100%" });
    expect(match("max-w-auto", maxWidthRules)).toBeUndefined();
    expect(match("max-w-md", maxWidthRules)).toEqual({ "max-width": "var(--container-md)" });
  });

  it("min/max height mirror the width axis with vh, no container scale", () => {
    expect(match("min-h-screen", minHeightRules)).toEqual({ "min-height": "100vh" });
    expect(match("max-h-none", maxHeightRules)).toEqual({ "max-height": "none" });
    expect(match("max-h-lh", maxHeightRules)).toEqual({ "max-height": "1lh" });
    expect(match("min-w-md", minWidthRules)).toBeUndefined();
    expect(match("max-h-md", maxHeightRules)).toBeUndefined();
  });
});

describe("preset sizing — container-scale baseContainerTokenPrefix", () => {
  it("swaps the CSS variable prefix via the factory, keeping other values intact", () => {
    const rules = createWidthRules({ baseContainerTokenPrefix: "size" });
    expect(match("w-3xs", rules)).toEqual({ width: "var(--size-3xs)" });
    expect(match("w-7xl", rules)).toEqual({ width: "var(--size-7xl)" });
    expect(match("w-4", rules)).toEqual({ width: "1rem" }); // numeric scale unaffected
    expect(match("w-full", rules)).toEqual({ width: "100%" }); // keywords unaffected
  });

  it("broadcasts through the sizing category options to every container-scale axis", () => {
    const rules = tailwindPreset({ include: ["sizing"], options: { sizing: { baseContainerTokenPrefix: "size" } } });
    expect(match("w-3xs", rules)).toEqual({ width: "var(--size-3xs)" });
    expect(match("max-w-md", rules)).toEqual({ "max-width": "var(--size-md)" });
    expect(match("size-lg", rules)).toEqual({ width: "var(--size-lg)", height: "var(--size-lg)" });
  });

  it("utility-path options override the category prefix per axis", () => {
    const rules = tailwindPreset({
      include: ["sizing"],
      options: { sizing: { baseContainerTokenPrefix: "a" }, "sizing/max-width": { baseContainerTokenPrefix: "b" } },
    });
    expect(match("w-3xs", rules)).toEqual({ width: "var(--a-3xs)" });
    expect(match("max-w-3xs", rules)).toEqual({ "max-width": "var(--b-3xs)" });
  });

  it("axes without the container scale stay without it regardless of the option", () => {
    const rules = tailwindPreset({ include: ["sizing"], options: { sizing: { baseContainerTokenPrefix: "size" } } });
    expect(match("min-w-3xs", rules)).toBeUndefined();
    expect(match("h-3xs", rules)).toBeUndefined();
  });
});

describe("preset sizing — excludeContainerClasses", () => {
  it("drops the container-scale rules via the factory, keeping everything else", () => {
    const rules = createWidthRules({ excludeContainerClasses: true });
    expect(match("w-3xs", rules)).toBeUndefined();
    expect(match("w-7xl", rules)).toBeUndefined();
    expect(match("w-4", rules)).toEqual({ width: "1rem" });
    expect(match("w-full", rules)).toEqual({ width: "100%" });
  });

  it("broadcasts through the sizing category options to every container-scale axis", () => {
    const rules = tailwindPreset({ include: ["sizing"], options: { sizing: { excludeContainerClasses: true } } });
    expect(match("w-3xs", rules)).toBeUndefined();
    expect(match("max-w-md", rules)).toBeUndefined();
    expect(match("size-lg", rules)).toBeUndefined();
    expect(match("w-full", rules)).toEqual({ width: "100%" }); // non-token keywords survive
  });

  it("utility-path options re-enable the scale per axis", () => {
    const rules = tailwindPreset({
      include: ["sizing"],
      options: { sizing: { excludeContainerClasses: true }, "sizing/width": { excludeContainerClasses: false } },
    });
    expect(match("w-3xs", rules)).toEqual({ width: "var(--container-3xs)" });
    expect(match("max-w-3xs", rules)).toBeUndefined();
  });

  it("wins over baseContainerTokenPrefix when both are set", () => {
    const rules = createWidthRules({ excludeContainerClasses: true, baseContainerTokenPrefix: "size" });
    expect(match("w-3xs", rules)).toBeUndefined();
  });
});

describe("preset sizing — numeric cap", () => {
  it("accepts values up to the default cap of 96 on every axis", () => {
    expect(match("w-96", widthRules)).toEqual({ width: "24rem" });
    expect(match("h-96", heightRules)).toEqual({ height: "24rem" });
    expect(match("min-w-96", minWidthRules)).toEqual({ "min-width": "24rem" });
    expect(match("max-h-96", maxHeightRules)).toEqual({ "max-height": "24rem" });
  });

  it("rejects values above the default cap", () => {
    expect(match("w-97", widthRules)).toBeUndefined();
    expect(match("h-97", heightRules)).toBeUndefined();
    expect(match("size-97", sizeRules)).toBeUndefined();
  });

  it("supports a custom cap via the factories", () => {
    const width = createWidthRules({ max: 10 });
    expect(match("w-10", width)).toEqual({ width: "2.5rem" });
    expect(match("w-11", width)).toBeUndefined();

    const sizing = createSizingRules({ max: 10 });
    expect(match("h-11", sizing)).toBeUndefined();
  });
});

describe("preset sizing — fraction guard", () => {
  it("accepts proper fractions with denominators up to 12", () => {
    expect(match("w-1/2", widthRules)).toEqual({ width: "calc(1/2 * 100%)" });
    expect(match("w-11/12", widthRules)).toEqual({ width: "calc(11/12 * 100%)" });
  });

  it("rejects improper or out-of-range fractions", () => {
    expect(match("w-2/2", widthRules)).toBeUndefined();
    expect(match("w-5/4", widthRules)).toBeUndefined();
    expect(match("w-0/2", widthRules)).toBeUndefined();
    expect(match("w-1/13", widthRules)).toBeUndefined();
  });
});
