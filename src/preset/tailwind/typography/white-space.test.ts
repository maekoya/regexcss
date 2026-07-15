import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { whiteSpaceRules } from "./white-space.ts";

describe("white-space", () => {
  it.each([
    ["whitespace-normal", "normal"],
    ["whitespace-nowrap", "nowrap"],
    ["whitespace-pre", "pre"],
    ["whitespace-pre-line", "pre-line"],
    ["whitespace-pre-wrap", "pre-wrap"],
    ["whitespace-break-spaces", "break-spaces"],
  ])("%j -> white-space: %j", (token, value) => {
    expect(match(token, whiteSpaceRules)).toEqual({ "white-space": value });
  });

  it.each(["whitespace-pre-", "whitespace-prewrap", "whitespace-wrap"])("rejects %j", (token) => {
    expect(match(token, whiteSpaceRules)).toBeUndefined();
  });
});
