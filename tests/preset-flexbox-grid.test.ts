import { describe, expect, it } from "vitest";
import { matchRule } from "../src/core/rules.ts";
import {
  alignContentRules,
  alignItemsRules,
  alignSelfRules,
  flexDirectionRules,
  flexWrapRules,
  gapRules,
  gridAutoColumnsRules,
  gridAutoFlowRules,
  gridAutoRowsRules,
  gridRowRules,
  gridTemplateColumnsRules,
  gridTemplateRowsRules,
  justifyContentRules,
  justifyItemsRules,
  justifySelfRules,
  orderRules,
} from "../src/preset/index.ts";
import type { Rule, RuleContext } from "../src/types.ts";

const ctx = (token: string): RuleContext => ({
  rawSelector: token,
  currentSelector: token,
  variants: [],
});

const match = (token: string, rules: Rule[]) => matchRule(token, rules, ctx(token))?.css;

describe("align-content", () => {
  it.each([
    ["content-normal", "normal"],
    ["content-center", "center"],
    ["content-start", "flex-start"],
    ["content-end", "flex-end"],
    ["content-between", "space-between"],
    ["content-around", "space-around"],
    ["content-evenly", "space-evenly"],
    ["content-baseline", "baseline"],
    ["content-stretch", "stretch"],
  ])("%s -> align-content: %s", (token, value) => {
    expect(match(token, alignContentRules)).toEqual({ "align-content": value });
  });

  it.each(["content", "content-", "content-auto", "content-space-between", "content-center-x"])(
    "rejects %j",
    (token) => {
      expect(match(token, alignContentRules)).toBeUndefined();
    },
  );
});

describe("align-items", () => {
  it.each([
    ["items-start", "flex-start"],
    ["items-end", "flex-end"],
    ["items-center", "center"],
    ["items-baseline", "baseline"],
    ["items-stretch", "stretch"],
  ])("%s -> align-items: %s", (token, value) => {
    expect(match(token, alignItemsRules)).toEqual({ "align-items": value });
  });

  it.each(["items-normal", "items-auto", "items-flex-start", "items-"])("rejects %j", (token) => {
    expect(match(token, alignItemsRules)).toBeUndefined();
  });
});

describe("align-self", () => {
  it.each([
    ["self-auto", "auto"],
    ["self-start", "flex-start"],
    ["self-end", "flex-end"],
    ["self-center", "center"],
    ["self-stretch", "stretch"],
    ["self-baseline", "baseline"],
  ])("%s -> align-self: %s", (token, value) => {
    expect(match(token, alignSelfRules)).toEqual({ "align-self": value });
  });

  it.each(["self-between", "self-normal", "self-"])("rejects %j", (token) => {
    expect(match(token, alignSelfRules)).toBeUndefined();
  });
});

describe("flex-direction", () => {
  it.each([
    ["flex-row", "row"],
    ["flex-row-reverse", "row-reverse"],
    ["flex-col", "column"],
    ["flex-col-reverse", "column-reverse"],
  ])("%s -> flex-direction: %s", (token, value) => {
    expect(match(token, flexDirectionRules)).toEqual({ "flex-direction": value });
  });

  it.each(["flex-column", "flex-column-reverse", "flex-row-reverse-x", "flex-"])("rejects %j", (token) => {
    expect(match(token, flexDirectionRules)).toBeUndefined();
  });
});

describe("flex-wrap", () => {
  it.each([
    ["flex-wrap", "wrap"],
    ["flex-wrap-reverse", "wrap-reverse"],
    ["flex-nowrap", "nowrap"],
  ])("%s -> flex-wrap: %s", (token, value) => {
    expect(match(token, flexWrapRules)).toEqual({ "flex-wrap": value });
  });

  it.each(["flex-no-wrap", "flex-wrap-reverse-x", "flex-wrapreverse"])("rejects %j", (token) => {
    expect(match(token, flexWrapRules)).toBeUndefined();
  });
});

describe("gap (smoke — full coverage in preset-spacing.test.ts)", () => {
  it("resolves gap, column-gap and row-gap", () => {
    expect(match("gap-4", gapRules)).toEqual({ gap: "1rem" });
    expect(match("gap-x-2", gapRules)).toEqual({ "column-gap": "0.5rem" });
    expect(match("gap-y-1.5", gapRules)).toEqual({ "row-gap": "0.375rem" });
  });

  it("rejects malformed tokens", () => {
    expect(match("gap-z-2", gapRules)).toBeUndefined();
    expect(match("gap-x-", gapRules)).toBeUndefined();
  });
});

describe("grid-auto-columns", () => {
  it.each([
    ["auto-cols-auto", "auto"],
    ["auto-cols-min", "min-content"],
    ["auto-cols-max", "max-content"],
    ["auto-cols-fr", "minmax(0, 1fr)"],
  ])("%s -> grid-auto-columns: %s", (token, value) => {
    expect(match(token, gridAutoColumnsRules)).toEqual({ "grid-auto-columns": value });
  });

  it.each(["auto-cols-1", "auto-cols-min-content", "auto-cols-"])("rejects %j", (token) => {
    expect(match(token, gridAutoColumnsRules)).toBeUndefined();
  });
});

describe("grid-auto-flow", () => {
  it.each([
    ["grid-flow-row", "row"],
    ["grid-flow-col", "column"],
    ["grid-flow-dense", "dense"],
    ["grid-flow-row-dense", "row dense"],
    ["grid-flow-col-dense", "column dense"],
  ])("%s -> grid-auto-flow: %s", (token, value) => {
    expect(match(token, gridAutoFlowRules)).toEqual({ "grid-auto-flow": value });
  });

  it.each(["grid-flow-column", "grid-flow-dense-row", "grid-flow-rowdense", "grid-flow-"])("rejects %j", (token) => {
    expect(match(token, gridAutoFlowRules)).toBeUndefined();
  });
});

describe("grid-auto-rows", () => {
  it.each([
    ["auto-rows-auto", "auto"],
    ["auto-rows-min", "min-content"],
    ["auto-rows-max", "max-content"],
    ["auto-rows-fr", "minmax(0, 1fr)"],
  ])("%s -> grid-auto-rows: %s", (token, value) => {
    expect(match(token, gridAutoRowsRules)).toEqual({ "grid-auto-rows": value });
  });

  it.each(["auto-rows-2", "auto-rows-max-content", "auto-rows-"])("rejects %j", (token) => {
    expect(match(token, gridAutoRowsRules)).toBeUndefined();
  });
});

describe("grid-row", () => {
  it("resolves the shorthand keywords", () => {
    expect(match("row-auto", gridRowRules)).toEqual({ "grid-row": "auto" });
    expect(match("row-span-full", gridRowRules)).toEqual({ "grid-row": "1 / -1" });
  });

  it.each([
    ["row-span-1", "span 1 / span 1"],
    ["row-span-12", "span 12 / span 12"],
  ])("%s -> grid-row: %s", (token, value) => {
    expect(match(token, gridRowRules)).toEqual({ "grid-row": value });
  });

  it("resolves grid-row-start (incl. negative and auto)", () => {
    expect(match("row-start-auto", gridRowRules)).toEqual({ "grid-row-start": "auto" });
    expect(match("row-start-2", gridRowRules)).toEqual({ "grid-row-start": "2" });
    expect(match("-row-start-2", gridRowRules)).toEqual({ "grid-row-start": "-2" });
  });

  it("resolves grid-row-end (incl. negative and auto)", () => {
    expect(match("row-end-auto", gridRowRules)).toEqual({ "grid-row-end": "auto" });
    expect(match("row-end-3", gridRowRules)).toEqual({ "grid-row-end": "3" });
    expect(match("-row-end-3", gridRowRules)).toEqual({ "grid-row-end": "-3" });
  });

  it.each(["row-span-", "row-span-1.5", "-row-span-2", "row-start--2", "row-start-1.5", "row-end-", "-row-auto"])(
    "rejects %j",
    (token) => {
      expect(match(token, gridRowRules)).toBeUndefined();
    },
  );
});

describe("grid-template-columns", () => {
  it("resolves keywords", () => {
    expect(match("grid-cols-none", gridTemplateColumnsRules)).toEqual({ "grid-template-columns": "none" });
    expect(match("grid-cols-subgrid", gridTemplateColumnsRules)).toEqual({ "grid-template-columns": "subgrid" });
  });

  it.each([
    ["grid-cols-1", "repeat(1, minmax(0, 1fr))"],
    ["grid-cols-12", "repeat(12, minmax(0, 1fr))"],
  ])("%s -> grid-template-columns: %s", (token, value) => {
    expect(match(token, gridTemplateColumnsRules)).toEqual({ "grid-template-columns": value });
  });

  it.each(["grid-cols-auto", "grid-cols-1.5", "grid-cols--1", "grid-cols-"])("rejects %j", (token) => {
    expect(match(token, gridTemplateColumnsRules)).toBeUndefined();
  });
});

describe("grid-template-rows", () => {
  it("resolves keywords", () => {
    expect(match("grid-rows-none", gridTemplateRowsRules)).toEqual({ "grid-template-rows": "none" });
    expect(match("grid-rows-subgrid", gridTemplateRowsRules)).toEqual({ "grid-template-rows": "subgrid" });
  });

  it.each([
    ["grid-rows-3", "repeat(3, minmax(0, 1fr))"],
    ["grid-rows-12", "repeat(12, minmax(0, 1fr))"],
  ])("%s -> grid-template-rows: %s", (token, value) => {
    expect(match(token, gridTemplateRowsRules)).toEqual({ "grid-template-rows": value });
  });

  it.each(["grid-rows-auto", "grid-rows-1.5", "grid-rows--1", "grid-rows-"])("rejects %j", (token) => {
    expect(match(token, gridTemplateRowsRules)).toBeUndefined();
  });
});

describe("justify-content", () => {
  it.each([
    ["justify-normal", "normal"],
    ["justify-start", "flex-start"],
    ["justify-end", "flex-end"],
    ["justify-center", "center"],
    ["justify-between", "space-between"],
    ["justify-around", "space-around"],
    ["justify-evenly", "space-evenly"],
    ["justify-stretch", "stretch"],
  ])("%s -> justify-content: %s", (token, value) => {
    expect(match(token, justifyContentRules)).toEqual({ "justify-content": value });
  });

  it.each(["justify-baseline", "justify-auto", "justify-space-between", "justify-"])("rejects %j", (token) => {
    expect(match(token, justifyContentRules)).toBeUndefined();
  });
});

describe("justify-items", () => {
  it.each(["normal", "start", "end", "center", "stretch"])("justify-items-%s passes the value through", (value) => {
    expect(match(`justify-items-${value}`, justifyItemsRules)).toEqual({ "justify-items": value });
  });

  it.each(["justify-items-baseline", "justify-items-auto", "justify-items-"])("rejects %j", (token) => {
    expect(match(token, justifyItemsRules)).toBeUndefined();
  });
});

describe("justify-self", () => {
  it.each(["auto", "start", "end", "center", "stretch"])("justify-self-%s passes the value through", (value) => {
    expect(match(`justify-self-${value}`, justifySelfRules)).toEqual({ "justify-self": value });
  });

  it.each(["justify-self-normal", "justify-self-baseline", "justify-self-"])("rejects %j", (token) => {
    expect(match(token, justifySelfRules)).toBeUndefined();
  });
});

describe("order", () => {
  it("resolves keywords", () => {
    expect(match("order-first", orderRules)).toEqual({ order: "calc(-infinity)" });
    expect(match("order-last", orderRules)).toEqual({ order: "calc(infinity)" });
    expect(match("order-none", orderRules)).toEqual({ order: "0" });
  });

  it.each([
    ["order-0", "0"],
    ["order-5", "5"],
    ["-order-3", "-3"],
  ])("%s -> order: %s", (token, value) => {
    expect(match(token, orderRules)).toEqual({ order: value });
  });

  it.each(["-order-first", "-order-none", "order--1", "order-1.5", "order-"])("rejects %j", (token) => {
    expect(match(token, orderRules)).toBeUndefined();
  });
});
