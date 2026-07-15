import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { gridAutoFlowRules } from "./grid-auto-flow.ts";

describe("grid-auto-flow", () => {
  it.each([
    ["grid-flow-row", "row"],
    ["grid-flow-col", "column"],
    ["grid-flow-dense", "dense"],
    ["grid-flow-row-dense", "row dense"],
    ["grid-flow-col-dense", "column dense"],
  ])("%s -> grid-auto-flow: %s", (token, value) => {
    expect(match(token, gridAutoFlowRules)).toEqual({ "grid-auto-flow": value });
  });

  it.each(["grid-flow-column", "grid-flow-dense-row", "grid-flow-rowdense", "grid-flow-"])("rejects %j", (token) => {
    expect(match(token, gridAutoFlowRules)).toBeUndefined();
  });
});
