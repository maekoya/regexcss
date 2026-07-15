import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { gridAutoColumnsRules } from "./grid-auto-columns.ts";

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
