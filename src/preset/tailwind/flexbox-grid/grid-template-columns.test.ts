import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { createGridTemplateColumnsRules } from "./grid-template-columns.ts";

const gridTemplateColumnsRules = createGridTemplateColumnsRules();

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
