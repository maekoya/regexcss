import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { flexDirectionRules } from "./flex-direction.ts";

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
