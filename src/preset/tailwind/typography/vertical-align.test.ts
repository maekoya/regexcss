import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { verticalAlignRules } from "./vertical-align.ts";

describe("vertical-align", () => {
  it.each([
    ["align-baseline", "baseline"],
    ["align-top", "top"],
    ["align-middle", "middle"],
    ["align-bottom", "bottom"],
    ["align-text-top", "text-top"],
    ["align-text-bottom", "text-bottom"],
    ["align-sub", "sub"],
    ["align-super", "super"],
  ])("%j -> vertical-align: %j", (token, value) => {
    expect(match(token, verticalAlignRules)).toEqual({ "vertical-align": value });
  });

  it.each(["align-text", "align-center", "align-"])("rejects %j", (token) => {
    expect(match(token, verticalAlignRules)).toBeUndefined();
  });
});
