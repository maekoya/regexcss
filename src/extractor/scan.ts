import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { glob } from "tinyglobby";
import type { ContentConfig } from "../types.ts";

export const resolveFiles = async (content: ContentConfig, cwd: string): Promise<string[]> => {
  if (content.include.length === 0) return [];
  const patterns = content.include.map((p) => resolve(cwd, p));
  const ignore = (content.exclude ?? []).map((p) => resolve(cwd, p));
  return glob(patterns, {
    absolute: true,
    ignore,
  });
};

// Cap on concurrent file reads. Unbounded `Promise.all` over a large source
// tree keeps every pending read's buffer alive at once (and risks EMFILE), so a
// rolling pool of workers claims files from a shared cursor instead — keeping at
// most SCAN_CONCURRENCY reads in flight regardless of how many files match.
const SCAN_CONCURRENCY = 32;

// Returns tokens per file (not one merged set) so callers can update a single
// file's entry on change events instead of re-reading the whole content tree.
export const scanFiles = async (
  files: string[],
  extract: (code: string) => Iterable<string>,
): Promise<Map<string, Set<string>>> => {
  const fileTokens = new Map<string, Set<string>>();
  let next = 0;

  const worker = async (): Promise<void> => {
    while (true) {
      const file = files[next++];
      if (file === undefined) break; // past the end (also satisfies noUncheckedIndexedAccess)
      const code = await readFile(file, "utf8");
      fileTokens.set(file, new Set(extract(code)));
    }
  };

  const workers = Array.from({ length: Math.min(SCAN_CONCURRENCY, files.length) }, worker);
  await Promise.all(workers);
  return fileTokens;
};
