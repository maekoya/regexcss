import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { positionRules } from "./position.ts";

describe("position", () => {
  it.each(["static", "fixed", "absolute", "relative", "sticky"])("maps %j to position: %j", (token) => {
    expect(match(token, positionRules)).toEqual({ position: token });
  });

  it.each(["position", "stickyy", "abs", "-fixed", "Sticky"])("rejects %j", (token) => {
    expect(match(token, positionRules)).toBeUndefined();
  });
});
