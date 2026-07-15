import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { justifyItemsRules } from "./justify-items.ts";

describe("justify-items", () => {
  it.each(["normal", "start", "end", "center", "stretch"])("justify-items-%s passes the value through", (value) => {
    expect(match(`justify-items-${value}`, justifyItemsRules)).toEqual({ "justify-items": value });
  });

  it.each(["justify-items-baseline", "justify-items-auto", "justify-items-"])("rejects %j", (token) => {
    expect(match(token, justifyItemsRules)).toBeUndefined();
  });
});
