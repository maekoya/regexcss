import { describe, expect, it } from "vitest";
import { createContentMatcher, orderConfigCandidates } from "../src/content.ts";

// Pure string-level matching — no filesystem needed (unlike the old walk-up resolver).

describe("createContentMatcher", () => {
  it("matches files under an include glob, relative to the config dir", () => {
    const matches = createContentMatcher({ include: ["src/**/*.html"] }, "/proj");
    expect(matches).not.toBeNull();
    expect(matches?.("/proj/src/a/b.html")).toBe(true);
    expect(matches?.("/proj/other/x.html")).toBe(false);
    expect(matches?.("/proj/src/a/b.ts")).toBe(false);
  });

  it("rejects files matched by exclude even when include matches", () => {
    const matches = createContentMatcher({ include: ["src/**"], exclude: ["src/legacy/**"] }, "/proj");
    expect(matches?.("/proj/src/app/x.html")).toBe(true);
    expect(matches?.("/proj/src/legacy/x.html")).toBe(false);
  });

  it("matches files above the config dir via ../ patterns", () => {
    const matches = createContentMatcher({ include: ["../shared/**/*.html"] }, "/proj/app");
    expect(matches?.("/proj/shared/x.html")).toBe(true);
    expect(matches?.("/proj/app/x.html")).toBe(false);
  });

  // tinyglobby's expandDirectories default: bare paths scan their whole subtree,
  // and the appended /** matches zero segments so literal file patterns still work.
  it("expands a bare directory include to its contents (tinyglobby parity)", () => {
    const matches = createContentMatcher({ include: ["src"] }, "/proj");
    expect(matches?.("/proj/src/deep/file.ts")).toBe(true);
    expect(matches?.("/proj/srcx/file.ts")).toBe(false);
  });

  it("matches a literal file include exactly (trailing /** matches zero segments)", () => {
    const matches = createContentMatcher({ include: ["./index.html"] }, "/proj");
    expect(matches?.("/proj/index.html")).toBe(true);
    expect(matches?.("/proj/src/index.html")).toBe(false);
  });

  it("expands a bare directory exclude to its contents", () => {
    const matches = createContentMatcher({ include: ["**/*.html"], exclude: ["dist"] }, "/proj");
    expect(matches?.("/proj/src/a.html")).toBe(true);
    expect(matches?.("/proj/dist/a.html")).toBe(false);
  });

  it("skips dot directories like the Vite plugin does (dot: false)", () => {
    const matches = createContentMatcher({ include: ["src/**/*.ts"] }, "/proj");
    expect(matches?.("/proj/src/.hidden/a.ts")).toBe(false);
  });

  it("returns null (dormant) for an empty or absent include", () => {
    expect(createContentMatcher({ include: [] }, "/proj")).toBeNull();
    expect(createContentMatcher(undefined, "/proj")).toBeNull();
  });
});

describe("orderConfigCandidates", () => {
  const app = "/repo/packages/app/regexcss.config.ts";
  const lib = "/repo/packages/lib/regexcss.config.ts";
  const root = "/repo/regexcss.config.ts";

  it("puts ancestor configs first, deepest first", () => {
    const doc = "/repo/packages/app/src/x.html";
    expect(orderConfigCandidates([root, lib, app], doc)).toEqual([app, root, lib]);
  });

  it("orders non-ancestor configs by shared path, then lexicographically", () => {
    // no config is an ancestor of /repo/shared — siblings tie on shared path
    const doc = "/repo/shared/x.html";
    expect(orderConfigCandidates([lib, app], doc)).toEqual([app, lib]);
  });

  it("does not treat /repo/app as an ancestor of /repo/app2 (segment-wise)", () => {
    const appConfig = "/repo/app/regexcss.config.ts";
    const app2Config = "/repo/app2/regexcss.config.ts";
    const doc = "/repo/app2/src/x.html";
    expect(orderConfigCandidates([appConfig, app2Config], doc)).toEqual([app2Config, appConfig]);
  });

  it("treats a config next to the document as an ancestor", () => {
    const doc = "/repo/packages/app/index.html";
    expect(orderConfigCandidates([root, app], doc)).toEqual([app, root]);
  });

  it("orders same-directory configs in regexcss auto-discovery order (ts before js)", () => {
    // lexicographically .js < .ts, but unconfig discovery (and thus the plugin) loads .ts first
    const ts = "/repo/regexcss.config.ts";
    const js = "/repo/regexcss.config.js";
    const doc = "/repo/src/x.html";
    expect(orderConfigCandidates([js, ts], doc)).toEqual([ts, js]);
  });
});
