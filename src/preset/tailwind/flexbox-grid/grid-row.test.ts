import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { createGridRowRules } from "./grid-row.ts";

const gridRowRules = createGridRowRules();

describe("grid-row", () => {
  it("resolves the shorthand keywords", () => {
    expect(match("row-auto", gridRowRules)).toEqual({ "grid-row": "auto" });
    expect(match("row-span-full", gridRowRules)).toEqual({ "grid-row": "1 / -1" });
  });

  it.each([
    ["row-span-1", "span 1 / span 1"],
    ["row-span-12", "span 12 / span 12"],
  ])("%s -> grid-row: %s", (token, value) => {
    expect(match(token, gridRowRules)).toEqual({ "grid-row": value });
  });

  it("resolves the numeric shorthand (incl. negative)", () => {
    expect(match("row-3", gridRowRules)).toEqual({ "grid-row": "3" });
    expect(match("-row-3", gridRowRules)).toEqual({ "grid-row": "-3" });
  });

  it("honours the max option", () => {
    const capped = createGridRowRules({ max: 4 });
    expect(match("row-span-4", capped)).toEqual({ "grid-row": "span 4 / span 4" });
    expect(match("row-span-5", capped)).toBeUndefined();
    expect(match("row-start-5", capped)).toBeUndefined();
    expect(match("row-end-5", capped)).toBeUndefined();
    expect(match("row-5", capped)).toBeUndefined();
  });

  it("resolves grid-row-start (incl. negative and auto)", () => {
    expect(match("row-start-auto", gridRowRules)).toEqual({ "grid-row-start": "auto" });
    expect(match("row-start-2", gridRowRules)).toEqual({ "grid-row-start": "2" });
    expect(match("-row-start-2", gridRowRules)).toEqual({ "grid-row-start": "-2" });
  });

  it("resolves grid-row-end (incl. negative and auto)", () => {
    expect(match("row-end-auto", gridRowRules)).toEqual({ "grid-row-end": "auto" });
    expect(match("row-end-3", gridRowRules)).toEqual({ "grid-row-end": "3" });
    expect(match("-row-end-3", gridRowRules)).toEqual({ "grid-row-end": "-3" });
  });

  it.each(["row-span-", "row-span-1.5", "-row-span-2", "row-start--2", "row-start-1.5", "row-end-", "-row-auto"])(
    "rejects %j",
    (token) => {
      expect(match(token, gridRowRules)).toBeUndefined();
    },
  );
});
