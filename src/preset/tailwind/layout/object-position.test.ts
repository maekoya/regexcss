import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { objectPositionRules } from "./object-position.ts";

describe("object-position", () => {
  it.each([
    ["object-bottom", "bottom"],
    ["object-center", "center"],
    ["object-left", "left"],
    ["object-right", "right"],
    ["object-top", "top"],
    // compound keys come first in the regex alternation, so they win over the single keywords
    ["object-left-bottom", "left bottom"],
    ["object-left-top", "left top"],
    ["object-right-bottom", "right bottom"],
    ["object-right-top", "right top"],
  ])("maps %j to object-position: %j", (token, value) => {
    expect(match(token, objectPositionRules)).toEqual({ "object-position": value });
  });

  it.each(["object-top-left", "object-center-top", "object-middle", "object-left-", "object-cover"])(
    "rejects %j",
    (token) => {
      expect(match(token, objectPositionRules)).toBeUndefined();
    },
  );
});
