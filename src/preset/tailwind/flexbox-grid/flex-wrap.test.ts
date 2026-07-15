import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { flexWrapRules } from "./flex-wrap.ts";

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
