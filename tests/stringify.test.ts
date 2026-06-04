import { describe, expect, it } from "vitest";
import { stringifyDeclarations } from "../src/core/stringify.ts";

describe("stringifyDeclarations", () => {
  it("passes through simple kebab-case declarations", () => {
    expect(stringifyDeclarations({ margin: "1px" })).toBe("margin: 1px;");
  });

  it("converts camelCase keys to kebab-case", () => {
    expect(stringifyDeclarations({ backgroundColor: "red" })).toBe("background-color: red;");
  });

  it("keeps CSS custom properties intact", () => {
    expect(stringifyDeclarations({ "--my-var": "10px" })).toBe("--my-var: 10px;");
  });

  it("emits multiple declarations joined by space", () => {
    expect(stringifyDeclarations({ margin: "1px", padding: "2px" })).toBe("margin: 1px; padding: 2px;");
  });
});
