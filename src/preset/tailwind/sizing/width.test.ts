import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { createWidthRules } from "./width.ts";

const widthRules = createWidthRules();

describe("preset sizing — width", () => {
  it.each([
    ["w-4", { width: "1rem" }],
    ["w-0.5", { width: "0.125rem" }],
    ["w-px", { width: "1px" }],
    ["w-full", { width: "100%" }],
    ["w-screen", { width: "100vw" }],
    ["w-min", { width: "min-content" }],
    ["w-max", { width: "max-content" }],
    ["w-fit", { width: "fit-content" }],
    ["w-auto", { width: "auto" }],
    ["w-dvw", { width: "100dvw" }],
    ["w-svh", { width: "100svh" }],
    ["w-1/2", { width: "calc(1/2 * 100%)" }],
    ["w-2/3", { width: "calc(2/3 * 100%)" }],
    ["w-3xs", { width: "var(--container-3xs)" }],
    ["w-sm", { width: "var(--container-sm)" }],
    ["w-2xl", { width: "var(--container-2xl)" }],
    ["w-7xl", { width: "var(--container-7xl)" }],
  ])("%s → %o", (token, css) => {
    expect(match(token, widthRules)).toEqual(css);
  });

  it.each(["w-", "w-.", "w-1.", "w-1/0", "w-1/", "w-bogus", "w-lh"])("rejects %j", (token) => {
    expect(match(token, widthRules)).toBeUndefined();
  });
});
