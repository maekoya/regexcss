import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { scanFiles } from "../src/extractor/scan.ts";

const splitWords = (code: string): string[] => code.split(/\s+/).filter(Boolean);

describe("scanFiles (bounded concurrency)", () => {
  let dir: string;
  let files: string[];
  // > SCAN_CONCURRENCY (32): forces the rolling pool to recycle workers across waves
  const COUNT = 100;

  beforeAll(async () => {
    dir = await mkdtemp(join(tmpdir(), "regexcss-scan-"));
    files = [];
    for (let i = 0; i < COUNT; i++) {
      const file = join(dir, `file-${i}.txt`);
      await writeFile(file, `shared token-${i}`, "utf8");
      files.push(file);
    }
  });

  afterAll(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("collects every token across more files than the concurrency cap", async () => {
    const tokens = await scanFiles(files, splitWords);
    expect(tokens.has("shared")).toBe(true);
    for (let i = 0; i < COUNT; i++) {
      expect(tokens.has(`token-${i}`)).toBe(true);
    }
    // the shared token dedups to a single entry + COUNT unique tokens
    expect(tokens.size).toBe(COUNT + 1);
  });

  it("returns an empty set for no files", async () => {
    expect((await scanFiles([], splitWords)).size).toBe(0);
  });

  it("handles fewer files than the cap", async () => {
    const tokens = await scanFiles(files.slice(0, 3), splitWords);
    expect(tokens.size).toBe(3 + 1); // token-0..2 + shared
  });
});
