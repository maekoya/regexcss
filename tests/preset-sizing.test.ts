import { describe, expect, it } from "vitest";
import { tailwindPreset } from "../src/preset/tailwind/index.ts";
import { createHeightRules } from "../src/preset/tailwind/sizing/height.ts";
import type { SizingOptions } from "../src/preset/tailwind/sizing/index.ts";
import { createMaxHeightRules } from "../src/preset/tailwind/sizing/max-height.ts";
import { createMaxWidthRules } from "../src/preset/tailwind/sizing/max-width.ts";
import { createMinHeightRules } from "../src/preset/tailwind/sizing/min-height.ts";
import { createMinWidthRules } from "../src/preset/tailwind/sizing/min-width.ts";
import { createSizeRules } from "../src/preset/tailwind/sizing/size.ts";
import { createWidthRules } from "../src/preset/tailwind/sizing/width.ts";
import { match } from "./preset-helpers.ts";

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

describe("preset sizing — width", () => {
  it.each([
    ["w-4", { width: "1rem" }],
    ["w-0.5", { width: "0.125rem" }],
    ["w-px", { width: "1px" }],
    ["w-full", { width: "100%" }],
    ["w-screen", { width: "100vw" }],
    ["w-min", { width: "min-content" }],
    ["w-max", { width: "max-content" }],
    ["w-fit", { width: "fit-content" }],
    ["w-auto", { width: "auto" }],
    ["w-dvw", { width: "100dvw" }],
    ["w-svh", { width: "100svh" }],
    ["w-1/2", { width: "calc(1/2 * 100%)" }],
    ["w-2/3", { width: "calc(2/3 * 100%)" }],
    ["w-3xs", { width: "var(--container-3xs)" }],
    ["w-sm", { width: "var(--container-sm)" }],
    ["w-2xl", { width: "var(--container-2xl)" }],
    ["w-7xl", { width: "var(--container-7xl)" }],
  ])("%s → %o", (token, css) => {
    expect(match(token, widthRules)).toEqual(css);
  });

  it.each(["w-", "w-.", "w-1.", "w-1/0", "w-1/", "w-bogus", "w-lh"])("rejects %j", (token) => {
    expect(match(token, widthRules)).toBeUndefined();
  });
});

describe("preset sizing — height", () => {
  it.each([
    ["h-4", { height: "1rem" }],
    ["h-screen", { height: "100vh" }],
    ["h-dvh", { height: "100dvh" }],
    ["h-lh", { height: "1lh" }],
    ["h-full", { height: "100%" }],
    ["h-3/4", { height: "calc(3/4 * 100%)" }],
  ])("%s → %o", (token, css) => {
    expect(match(token, heightRules)).toEqual(css);
  });
});

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

describe("preset sizing — size", () => {
  it.each([
    ["size-4", { width: "1rem", height: "1rem" }],
    ["size-full", { width: "100%", height: "100%" }],
    ["size-1/2", { width: "calc(1/2 * 100%)", height: "calc(1/2 * 100%)" }],
    ["size-auto", { width: "auto", height: "auto" }],
    ["size-lg", { width: "var(--container-lg)", height: "var(--container-lg)" }],
  ])("%s → %o", (token, css) => {
    expect(match(token, sizeRules)).toEqual(css);
  });

  it("has no screen keyword (axes differ)", () => {
    expect(match("size-screen", sizeRules)).toBeUndefined();
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
