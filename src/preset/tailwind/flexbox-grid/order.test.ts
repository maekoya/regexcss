import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { createGridRowRules } from "./grid-row.ts";
import { createGridTemplateColumnsRules } from "./grid-template-columns.ts";
import { createGridTemplateRowsRules } from "./grid-template-rows.ts";
import { createOrderRules } from "./order.ts";

const gridRowRules = createGridRowRules();
const gridTemplateColumnsRules = createGridTemplateColumnsRules();
const gridTemplateRowsRules = createGridTemplateRowsRules();
const orderRules = createOrderRules();

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

describe("numeric caps (default 12)", () => {
  it("rejects values above the default cap", () => {
    expect(match("grid-cols-13", gridTemplateColumnsRules)).toBeUndefined();
    expect(match("grid-rows-13", gridTemplateRowsRules)).toBeUndefined();
    expect(match("row-span-13", gridRowRules)).toBeUndefined();
    expect(match("row-start-13", gridRowRules)).toBeUndefined();
    expect(match("-row-end-13", gridRowRules)).toBeUndefined();
    expect(match("order-13", orderRules)).toBeUndefined();
  });

  it("supports a custom cap via the factories", () => {
    const order = createOrderRules({ max: 20 });
    expect(match("order-20", order)).toEqual({ order: "20" });
    expect(match("order-21", order)).toBeUndefined();
  });
});
