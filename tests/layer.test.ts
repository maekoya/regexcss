import { describe, expect, it } from "vitest";
import { renderLayer } from "../src/core/layer.ts";

describe("renderLayer", () => {
  it("wraps the body in @layer for a valid name", () => {
    expect(renderLayer(".m-1 { margin: 1px; }", "utilities")).toBe("@layer utilities {\n  .m-1 { margin: 1px; }\n}");
  });

  it("allows nested (dot-separated) layer names", () => {
    expect(renderLayer("x", "website.utilities")).toContain("@layer website.utilities {");
  });

  it.each(["my-layer_1", "_private", "-webkit", "--foo", "a.b.c"])(
    "allows the valid CSS-ident layer name %j",
    (name) => {
      expect(() => renderLayer("x", name)).not.toThrow();
    },
  );

  it("returns the body unchanged when layerName is falsy", () => {
    expect(renderLayer(".a {}", undefined)).toBe(".a {}");
    expect(renderLayer(".a {}", "")).toBe(".a {}");
  });

  it("returns an empty body unchanged for a valid name", () => {
    expect(renderLayer("", "utilities")).toBe("");
  });

  it("validates the name even when the body is empty (catches config typos early)", () => {
    expect(() => renderLayer("", "1bad")).toThrow(/Invalid @layer name/);
  });

  it.each([
    "foo}",
    "a b",
    "{evil}",
    ".lead",
    "trail.",
    "a..b",
    "color: red",
    "utilities;",
    // segments must not start with a digit (invalid CSS <ident>)
    "1",
    "123",
    "1utilities",
    "1.foo",
    "foo.2bar",
    // a leading `-` must be followed by a non-digit; a lone `-` is invalid
    "-1",
    "-",
    "-9abc",
    "a.-2",
  ])("throws on the invalid layer name %j", (name) => {
    expect(() => renderLayer(".a {}", name)).toThrow(/Invalid @layer name/);
  });
});
