import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { fontWeightRules } from "./font-weight.ts";

describe("font-weight", () => {
  it.each([
    ["font-thin", "100"],
    ["font-extralight", "200"],
    ["font-light", "300"],
    ["font-normal", "400"],
    ["font-medium", "500"],
    ["font-semibold", "600"],
    ["font-bold", "700"],
    ["font-extrabold", "800"],
    ["font-black", "900"],
  ])("%j -> font-weight: %j", (token, weight) => {
    expect(match(token, fontWeightRules)).toEqual({ "font-weight": weight });
  });

  it.each(["font-700", "font-bolder", "bold", "font-boldx"])("rejects %j", (token) => {
    expect(match(token, fontWeightRules)).toBeUndefined();
  });
});
