import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { createGridColumnRules } from "./grid-column.ts";

const gridColumnRules = createGridColumnRules();

describe("grid-column", () => {
  it("resolves the shorthand keywords", () => {
    expect(match("col-auto", gridColumnRules)).toEqual({ "grid-column": "auto" });
    expect(match("col-span-full", gridColumnRules)).toEqual({ "grid-column": "1 / -1" });
  });

  it.each([
    ["col-span-1", "span 1 / span 1"],
    ["col-span-12", "span 12 / span 12"],
  ])("%s -> grid-column: %s", (token, value) => {
    expect(match(token, gridColumnRules)).toEqual({ "grid-column": value });
  });

  it("resolves the numeric shorthand (incl. negative)", () => {
    expect(match("col-3", gridColumnRules)).toEqual({ "grid-column": "3" });
    expect(match("-col-3", gridColumnRules)).toEqual({ "grid-column": "-3" });
  });

  it("resolves grid-column-start (incl. negative and auto)", () => {
    expect(match("col-start-auto", gridColumnRules)).toEqual({ "grid-column-start": "auto" });
    expect(match("col-start-2", gridColumnRules)).toEqual({ "grid-column-start": "2" });
    expect(match("-col-start-2", gridColumnRules)).toEqual({ "grid-column-start": "-2" });
  });

  it("resolves grid-column-end (incl. negative and auto)", () => {
    expect(match("col-end-auto", gridColumnRules)).toEqual({ "grid-column-end": "auto" });
    expect(match("col-end-3", gridColumnRules)).toEqual({ "grid-column-end": "3" });
    expect(match("-col-end-3", gridColumnRules)).toEqual({ "grid-column-end": "-3" });
  });

  it("honours the max option", () => {
    const capped = createGridColumnRules({ max: 4 });
    expect(match("col-span-4", capped)).toEqual({ "grid-column": "span 4 / span 4" });
    expect(match("col-span-5", capped)).toBeUndefined();
    expect(match("col-start-5", capped)).toBeUndefined();
    expect(match("col-end-5", capped)).toBeUndefined();
    expect(match("col-5", capped)).toBeUndefined();
  });

  it.each(["col-span-", "col-span-1.5", "-col-span-2", "col-start--2", "col-start-1.5", "col-end-", "-col-auto"])(
    "rejects %j",
    (token) => {
      expect(match(token, gridColumnRules)).toBeUndefined();
    },
  );
});
