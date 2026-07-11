import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { findConfigFile } from "../src/resolve.ts";

// A tiny monorepo:
//   root/
//     regexcss.config.ts            (root config)
//     packages/foo/regexcss.config.ts
//     packages/foo/src/             (no config here)
//     packages/bar/                 (no config → falls back to root)
let root: string;

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), "regexcss-resolve-"));
  mkdirSync(join(root, "packages/foo/src"), { recursive: true });
  mkdirSync(join(root, "packages/bar/src"), { recursive: true });
  writeFileSync(join(root, "regexcss.config.ts"), "export default {}");
  writeFileSync(join(root, "packages/foo/regexcss.config.ts"), "export default {}");
});

describe("findConfigFile", () => {
  it("finds the nearest config walking up", () => {
    expect(findConfigFile(join(root, "packages/foo/src"), root)).toBe(join(root, "packages/foo/regexcss.config.ts"));
  });

  it("falls back to an ancestor config when the folder has none", () => {
    expect(findConfigFile(join(root, "packages/bar/src"), root)).toBe(join(root, "regexcss.config.ts"));
  });

  it("returns undefined when no config exists within the boundary", () => {
    // stopDir below the only configs → nothing found
    expect(findConfigFile(join(root, "packages/bar/src"), join(root, "packages/bar"))).toBeUndefined();
  });

  it("matches a config in the start dir itself", () => {
    expect(findConfigFile(join(root, "packages/foo"), root)).toBe(join(root, "packages/foo/regexcss.config.ts"));
  });
});
