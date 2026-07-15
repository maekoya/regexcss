import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { fontStyleRules } from "./font-style.ts";

describe("font-style", () => {
  it("maps italic and not-italic", () => {
    expect(match("italic", fontStyleRules)).toEqual({ "font-style": "italic" });
    expect(match("not-italic", fontStyleRules)).toEqual({ "font-style": "normal" });
  });

  it.each(["italics", "not-italics", "font-italic"])("rejects %j", (token) => {
    expect(match(token, fontStyleRules)).toBeUndefined();
  });
});
