import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { placeItemsRules } from "./place-items.ts";

describe("place-items", () => {
  it.each([
    ["place-items-start", "start"],
    ["place-items-end", "end"],
    ["place-items-center", "center"],
    ["place-items-baseline", "baseline"],
    ["place-items-stretch", "stretch"],
  ])("%s -> place-items: %s", (token, value) => {
    expect(match(token, placeItemsRules)).toEqual({ "place-items": value });
  });

  it.each(["place-items", "place-items-", "place-items-auto", "place-items-center-x"])("rejects %j", (token) => {
    expect(match(token, placeItemsRules)).toBeUndefined();
  });
});
