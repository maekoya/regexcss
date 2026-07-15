import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { gridAutoRowsRules } from "./grid-auto-rows.ts";

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
