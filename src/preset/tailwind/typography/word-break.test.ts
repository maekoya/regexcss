import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { wordBreakRules } from "./word-break.ts";

describe("word-break", () => {
  it.each([
    ["break-normal", "normal"],
    ["break-all", "break-all"],
    ["break-keep", "keep-all"],
  ])("%j -> word-break: %j", (token, value) => {
    expect(match(token, wordBreakRules)).toEqual({ "word-break": value });
  });

  it.each(["break-words", "break-word", "break-keep-all"])("rejects %j", (token) => {
    expect(match(token, wordBreakRules)).toBeUndefined();
  });
});
