import { describe, expect, it } from "vitest";
import { matchRule } from "../src/core/rules.ts";
import {
  createZIndexRules,
  displayRules,
  objectFitRules,
  objectPositionRules,
  overflowRules,
  overscrollRules,
  positionRules,
  zIndexRules,
} from "../src/preset/index.ts";
import type { Rule, RuleContext } from "../src/types.ts";

const ctx = (token: string): RuleContext => ({
  rawSelector: token,
  currentSelector: token,
  variants: [],
});

const match = (token: string, rules: Rule[]) => matchRule(token, rules, ctx(token))?.css;

describe("preset layout display", () => {
  it.each([
    ["inline", "inline"],
    ["block", "block"],
    ["inline-block", "inline-block"],
    ["flow-root", "flow-root"],
    ["flex", "flex"],
    ["inline-flex", "inline-flex"],
    ["grid", "grid"],
    ["inline-grid", "inline-grid"],
    ["contents", "contents"],
    ["table", "table"],
    ["inline-table", "inline-table"],
    ["table-caption", "table-caption"],
    ["table-cell", "table-cell"],
    ["table-column", "table-column"],
    ["table-column-group", "table-column-group"],
    ["table-footer-group", "table-footer-group"],
    ["table-header-group", "table-header-group"],
    ["table-row-group", "table-row-group"],
    ["table-row", "table-row"],
    ["list-item", "list-item"],
    ["hidden", "none"],
  ])("maps %j to display: %j", (token, value) => {
    expect(match(token, displayRules)).toEqual({ display: value });
  });

  it("emits the full sr-only declaration block", () => {
    expect(match("sr-only", displayRules)).toEqual({
      position: "absolute",
      width: "1px",
      height: "1px",
      padding: "0",
      margin: "-1px",
      overflow: "hidden",
      clip: "rect(0, 0, 0, 0)",
      "white-space": "nowrap",
      "border-width": "0",
    });
  });

  it("emits the full not-sr-only declaration block (no border-width reset)", () => {
    expect(match("not-sr-only", displayRules)).toEqual({
      position: "static",
      width: "auto",
      height: "auto",
      padding: "0",
      margin: "0",
      overflow: "visible",
      clip: "auto",
      "white-space": "normal",
    });
  });

  it.each(["none", "display", "inline-", "tablecell", "table-rows", "flexx", "Hidden"])(
    "rejects the near-miss token %j",
    (token) => {
      expect(match(token, displayRules)).toBeUndefined();
    },
  );
});

describe("preset layout object-fit", () => {
  it.each([
    ["object-contain", "contain"],
    ["object-cover", "cover"],
    ["object-fill", "fill"],
    ["object-none", "none"],
    ["object-scale-down", "scale-down"],
  ])("maps %j to object-fit: %j", (token, value) => {
    expect(match(token, objectFitRules)).toEqual({ "object-fit": value });
  });

  it.each(["object-center", "object-stretch", "object-scale", "object-", "object-cover-x"])("rejects %j", (token) => {
    expect(match(token, objectFitRules)).toBeUndefined();
  });
});

describe("preset layout object-position", () => {
  it.each([
    ["object-bottom", "bottom"],
    ["object-center", "center"],
    ["object-left", "left"],
    ["object-right", "right"],
    ["object-top", "top"],
    // compound keys come first in the regex alternation, so they win over the single keywords
    ["object-left-bottom", "left bottom"],
    ["object-left-top", "left top"],
    ["object-right-bottom", "right bottom"],
    ["object-right-top", "right top"],
  ])("maps %j to object-position: %j", (token, value) => {
    expect(match(token, objectPositionRules)).toEqual({ "object-position": value });
  });

  it.each(["object-top-left", "object-center-top", "object-middle", "object-left-", "object-cover"])(
    "rejects %j",
    (token) => {
      expect(match(token, objectPositionRules)).toBeUndefined();
    },
  );
});

describe("preset layout overflow", () => {
  it.each([
    ["overflow-auto", { overflow: "auto" }],
    ["overflow-hidden", { overflow: "hidden" }],
    ["overflow-clip", { overflow: "clip" }],
    ["overflow-visible", { overflow: "visible" }],
    ["overflow-scroll", { overflow: "scroll" }],
    ["overflow-x-auto", { "overflow-x": "auto" }],
    ["overflow-x-hidden", { "overflow-x": "hidden" }],
    ["overflow-y-scroll", { "overflow-y": "scroll" }],
    ["overflow-y-clip", { "overflow-y": "clip" }],
  ])("maps %j", (token, css) => {
    expect(match(token, overflowRules)).toEqual(css);
  });

  it.each(["overflow", "overflow-", "overflow--auto", "overflow-z-auto", "overflow-x", "overflow-x-", "overflow-none"])(
    "rejects %j",
    (token) => {
      expect(match(token, overflowRules)).toBeUndefined();
    },
  );
});

describe("preset layout overscroll", () => {
  it.each([
    ["overscroll-auto", { "overscroll-behavior": "auto" }],
    ["overscroll-contain", { "overscroll-behavior": "contain" }],
    ["overscroll-none", { "overscroll-behavior": "none" }],
    ["overscroll-x-auto", { "overscroll-behavior-x": "auto" }],
    ["overscroll-x-contain", { "overscroll-behavior-x": "contain" }],
    ["overscroll-y-none", { "overscroll-behavior-y": "none" }],
  ])("maps %j", (token, css) => {
    expect(match(token, overscrollRules)).toEqual(css);
  });

  it.each([
    "overscroll",
    "overscroll-",
    "overscroll--auto",
    "overscroll-x-scroll",
    "overscroll-z-none",
    "overscroll-hidden",
  ])("rejects %j", (token) => {
    expect(match(token, overscrollRules)).toBeUndefined();
  });
});

describe("preset layout position", () => {
  it.each(["static", "fixed", "absolute", "relative", "sticky"])("maps %j to position: %j", (token) => {
    expect(match(token, positionRules)).toEqual({ position: token });
  });

  it.each(["position", "stickyy", "abs", "-fixed", "Sticky"])("rejects %j", (token) => {
    expect(match(token, positionRules)).toBeUndefined();
  });
});

describe("preset layout z-index", () => {
  it("supports z-auto", () => {
    expect(match("z-auto", zIndexRules)).toEqual({ "z-index": "auto" });
  });

  it("accepts any integer up to the default cap of 10", () => {
    expect(match("z-0", zIndexRules)).toEqual({ "z-index": "0" });
    expect(match("z-5", zIndexRules)).toEqual({ "z-index": "5" });
    expect(match("z-10", zIndexRules)).toEqual({ "z-index": "10" });
    expect(match("z-11", zIndexRules)).toBeUndefined();
    expect(match("z-999", zIndexRules)).toBeUndefined();
  });

  it("supports a custom cap via createZIndexRules", () => {
    const rules = createZIndexRules({ max: 100 });
    expect(match("z-100", rules)).toEqual({ "z-index": "100" });
    expect(match("z-101", rules)).toBeUndefined();
  });

  it("handles negatives via the leading-dash form", () => {
    expect(match("-z-10", zIndexRules)).toEqual({ "z-index": "-10" });
    expect(match("-z-0", zIndexRules)).toEqual({ "z-index": "-0" });
  });

  it.each(["z-", "z--1", "z-1.5", "z-a", "-z-auto", "--z-10", "z-10px"])("rejects %j", (token) => {
    expect(match(token, zIndexRules)).toBeUndefined();
  });
});
