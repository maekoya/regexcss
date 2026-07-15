import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { textWrapRules } from "./text-wrap.ts";

describe("text-wrap", () => {
  it.each([
    ["text-wrap", "wrap"],
    ["text-nowrap", "nowrap"],
    ["text-balance", "balance"],
    ["text-pretty", "pretty"],
  ])("%j -> text-wrap: %j", (token, value) => {
    expect(match(token, textWrapRules)).toEqual({ "text-wrap": value });
  });

  it.each(["text-wraps", "wrap", "text-no-wrap"])("rejects %j", (token) => {
    expect(match(token, textWrapRules)).toBeUndefined();
  });
});
