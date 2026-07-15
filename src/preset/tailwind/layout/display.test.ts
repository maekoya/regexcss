import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { displayRules } from "./display.ts";

describe("display", () => {
  it.each([
    ["inline", "inline"],
    ["block", "block"],
    ["inline-block", "inline-block"],
    ["flow-root", "flow-root"],
    ["flex", "flex"],
    ["inline-flex", "inline-flex"],
    ["grid", "grid"],
    ["inline-grid", "inline-grid"],
    ["contents", "contents"],
    ["table", "table"],
    ["inline-table", "inline-table"],
    ["table-caption", "table-caption"],
    ["table-cell", "table-cell"],
    ["table-column", "table-column"],
    ["table-column-group", "table-column-group"],
    ["table-footer-group", "table-footer-group"],
    ["table-header-group", "table-header-group"],
    ["table-row-group", "table-row-group"],
    ["table-row", "table-row"],
    ["list-item", "list-item"],
    ["hidden", "none"],
  ])("maps %j to display: %j", (token, value) => {
    expect(match(token, displayRules)).toEqual({ display: value });
  });

  it("emits the full sr-only declaration block", () => {
    expect(match("sr-only", displayRules)).toEqual({
      position: "absolute",
      width: "1px",
      height: "1px",
      padding: "0",
      margin: "-1px",
      overflow: "hidden",
      clip: "rect(0, 0, 0, 0)",
      "white-space": "nowrap",
      "border-width": "0",
    });
  });

  it("emits the full not-sr-only declaration block (no border-width reset)", () => {
    expect(match("not-sr-only", displayRules)).toEqual({
      position: "static",
      width: "auto",
      height: "auto",
      padding: "0",
      margin: "0",
      overflow: "visible",
      clip: "auto",
      "white-space": "normal",
    });
  });

  it.each(["none", "display", "inline-", "tablecell", "table-rows", "flexx", "Hidden"])(
    "rejects the near-miss token %j",
    (token) => {
      expect(match(token, displayRules)).toBeUndefined();
    },
  );
});
