import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { alignContentRules } from "./align-content.ts";

describe("align-content", () => {
  it.each([
    ["content-normal", "normal"],
    ["content-center", "center"],
    ["content-start", "flex-start"],
    ["content-end", "flex-end"],
    ["content-between", "space-between"],
    ["content-around", "space-around"],
    ["content-evenly", "space-evenly"],
    ["content-baseline", "baseline"],
    ["content-stretch", "stretch"],
  ])("%s -> align-content: %s", (token, value) => {
    expect(match(token, alignContentRules)).toEqual({ "align-content": value });
  });

  it.each(["content", "content-", "content-auto", "content-space-between", "content-center-x"])(
    "rejects %j",
    (token) => {
      expect(match(token, alignContentRules)).toBeUndefined();
    },
  );
});
