import { describe, expect, it } from "vitest";
import { matchRule } from "../src/core/rules.ts";
import {
  heightRules,
  maxHeightRules,
  maxWidthRules,
  minHeightRules,
  minWidthRules,
  sizeRules,
  widthRules,
} from "../src/preset/index.ts";
import type { CSSObject, Rule, RuleContext } from "../src/types.ts";

const ctx = (token: string): RuleContext => ({
  rawSelector: token,
  currentSelector: token,
  variants: [],
});

const match = (token: string, rules: Rule[]): CSSObject | undefined =>
  matchRule(token, rules, ctx(token))?.css as CSSObject | undefined;

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
