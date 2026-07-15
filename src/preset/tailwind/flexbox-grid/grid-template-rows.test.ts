import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { createGridTemplateRowsRules } from "./grid-template-rows.ts";

const gridTemplateRowsRules = createGridTemplateRowsRules();

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
