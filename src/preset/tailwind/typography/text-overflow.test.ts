import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { textOverflowRules } from "./text-overflow.ts";

describe("text-overflow", () => {
  it("truncate emits the three-property block", () => {
    expect(match("truncate", textOverflowRules)).toEqual({
      overflow: "hidden",
      "text-overflow": "ellipsis",
      "white-space": "nowrap",
    });
  });

  it("text-ellipsis / text-clip emit text-overflow only", () => {
    expect(match("text-ellipsis", textOverflowRules)).toEqual({ "text-overflow": "ellipsis" });
    expect(match("text-clip", textOverflowRules)).toEqual({ "text-overflow": "clip" });
  });

  it.each(["truncated", "text-truncate", "ellipsis"])("rejects %j", (token) => {
    expect(match(token, textOverflowRules)).toBeUndefined();
  });
});
