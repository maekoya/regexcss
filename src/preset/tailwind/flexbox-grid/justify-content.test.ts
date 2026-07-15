import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { justifyContentRules } from "./justify-content.ts";

describe("justify-content", () => {
  it.each([
    ["justify-normal", "normal"],
    ["justify-start", "flex-start"],
    ["justify-end", "flex-end"],
    ["justify-center", "center"],
    ["justify-between", "space-between"],
    ["justify-around", "space-around"],
    ["justify-evenly", "space-evenly"],
    ["justify-stretch", "stretch"],
  ])("%s -> justify-content: %s", (token, value) => {
    expect(match(token, justifyContentRules)).toEqual({ "justify-content": value });
  });

  it.each(["justify-baseline", "justify-auto", "justify-space-between", "justify-"])("rejects %j", (token) => {
    expect(match(token, justifyContentRules)).toBeUndefined();
  });
});
