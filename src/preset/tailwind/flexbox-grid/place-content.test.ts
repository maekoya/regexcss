import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { placeContentRules } from "./place-content.ts";

describe("place-content", () => {
  it.each([
    ["place-content-center", "center"],
    ["place-content-start", "start"],
    ["place-content-end", "end"],
    ["place-content-between", "space-between"],
    ["place-content-around", "space-around"],
    ["place-content-evenly", "space-evenly"],
    ["place-content-baseline", "baseline"],
    ["place-content-stretch", "stretch"],
  ])("%s -> place-content: %s", (token, value) => {
    expect(match(token, placeContentRules)).toEqual({ "place-content": value });
  });

  it.each([
    "place-content",
    "place-content-",
    "place-content-normal",
    "place-content-space-between",
    "place-content-center-x",
  ])("rejects %j", (token) => {
    expect(match(token, placeContentRules)).toBeUndefined();
  });
});
