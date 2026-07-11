import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

// No vscode dependency so it can be unit-tested directly.

// Same order/extensions as regexcss auto-discovery.
const CONFIG_EXTS = ["ts", "mts", "js", "mjs", "cjs"];

/**
 * Walk up from `startDir` (inclusive) to `stopDir` (inclusive) looking for a
 * `regexcss.config.*` file — the nearest one wins, so each package under a monorepo
 * uses its own config. Returns the absolute path of the nearest config, or undefined
 * if none exists within the boundary. `stopDir` is expected to be an ancestor of
 * `startDir` (the document's workspace folder).
 */
export const findConfigFile = (startDir: string, stopDir: string): string | undefined => {
  let dir = startDir;
  for (;;) {
    for (const ext of CONFIG_EXTS) {
      const candidate = join(dir, `regexcss.config.${ext}`);
      if (existsSync(candidate)) return candidate;
    }
    if (dir === stopDir) return undefined;
    const parent = dirname(dir);
    if (parent === dir) return undefined; // reached the filesystem root
    dir = parent;
  }
};
