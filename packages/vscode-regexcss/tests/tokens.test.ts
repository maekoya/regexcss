import { describe, expect, it } from "vitest";
import { classAttributeContext, tokenAt } from "../src/tokens.ts";

describe("tokenAt", () => {
  it("expands over class-token characters around the cursor", () => {
    const line = `<div class="mt-4 md:m-2">`;
    // cursor inside "mt-4"
    expect(tokenAt(line, 14)).toEqual({ text: "mt-4", start: 12, end: 16 });
    // cursor inside "md:m-2" (has a colon)
    expect(tokenAt(line, 20)).toEqual({ text: "md:m-2", start: 17, end: 23 });
  });

  it("returns undefined when the cursor is not on a token", () => {
    expect(tokenAt(`a  b`, 2)).toBeUndefined(); // between the two spaces, not touching a token
    expect(tokenAt(``, 0)).toBeUndefined();
  });

  it("catches the token when the cursor is at its trailing edge", () => {
    expect(tokenAt(`flex `, 4)).toEqual({ text: "flex", start: 0, end: 4 });
  });
});

describe("classAttributeContext", () => {
  const attrs = ["class", "className", "class:list"];

  it("detects an open class attribute and the current word", () => {
    expect(classAttributeContext(`<div class="mt-4 m-`, attrs)).toEqual({ value: "mt-4 m-", word: "m-" });
    expect(classAttributeContext(`<div className="`, attrs)).toEqual({ value: "", word: "" });
    expect(classAttributeContext("<a class=`flex it", attrs)).toEqual({ value: "flex it", word: "it" });
  });

  it("returns undefined outside a class attribute or after the string closes", () => {
    expect(classAttributeContext(`<div id="foo`, attrs)).toBeUndefined();
    expect(classAttributeContext(`<div class="mt-4" `, attrs)).toBeUndefined(); // closed
    expect(classAttributeContext(`plain text m-`, attrs)).toBeUndefined();
  });

  it("respects the configured attribute list", () => {
    expect(classAttributeContext(`<div className="m-`, ["class"])).toBeUndefined();
    expect(classAttributeContext(`<div className="m-`, ["className"])).toEqual({ value: "m-", word: "m-" });
  });
});
