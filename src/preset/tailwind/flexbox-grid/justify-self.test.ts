import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { justifySelfRules } from "./justify-self.ts";

describe("justify-self", () => {
  it.each(["auto", "start", "end", "center", "stretch"])("justify-self-%s passes the value through", (value) => {
    expect(match(`justify-self-${value}`, justifySelfRules)).toEqual({ "justify-self": value });
  });

  it.each(["justify-self-normal", "justify-self-baseline", "justify-self-"])("rejects %j", (token) => {
    expect(match(token, justifySelfRules)).toBeUndefined();
  });
});
