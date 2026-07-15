import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { alignItemsRules } from "./align-items.ts";

describe("align-items", () => {
  it.each([
    ["items-start", "flex-start"],
    ["items-end", "flex-end"],
    ["items-center", "center"],
    ["items-baseline", "baseline"],
    ["items-stretch", "stretch"],
  ])("%s -> align-items: %s", (token, value) => {
    expect(match(token, alignItemsRules)).toEqual({ "align-items": value });
  });

  it.each(["items-normal", "items-auto", "items-flex-start", "items-"])("rejects %j", (token) => {
    expect(match(token, alignItemsRules)).toBeUndefined();
  });
});
