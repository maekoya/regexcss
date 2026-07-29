import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { placeSelfRules } from "./place-self.ts";

describe("place-self", () => {
  it.each([
    ["place-self-auto", "auto"],
    ["place-self-start", "start"],
    ["place-self-end", "end"],
    ["place-self-center", "center"],
    ["place-self-stretch", "stretch"],
  ])("%s -> place-self: %s", (token, value) => {
    expect(match(token, placeSelfRules)).toEqual({ "place-self": value });
  });

  it.each(["place-self", "place-self-", "place-self-baseline", "place-self-center-x"])("rejects %j", (token) => {
    expect(match(token, placeSelfRules)).toBeUndefined();
  });
});
