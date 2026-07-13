import { dirname, isAbsolute, resolve } from "node:path";
import picomatch from "picomatch";
import type { ContentConfig } from "regexcss";

// No vscode dependency so it can be unit-tested directly.

/** Predicate over absolute file paths: is this file governed by the config's content globs? */
export type ContentMatcher = (absPath: string) => boolean;

// Same options tinyglobby passes to picomatch (dot files skipped, posix classes on),
// so the extension activates for exactly the files the Vite plugin would scan.
const MATCH_OPTIONS = { dot: false, posix: true } as const;

const toPosix = (p: string): string => p.replace(/\\/g, "/");

// picomatch ships no escape helper (that's micromatch) — backslash every glob
// metacharacter so the path reads as literal text; "/" separators stay untouched.
const escapeGlob = (p: string): string => p.replace(/[\\*?[\]{}()!@+|]/g, (c) => `\\${c}`);

// Mirror tinyglobby's normalizePattern with its expandDirectories:true default —
// strip a trailing "/", then append "/**" unless the pattern already ends with "*".
// picomatch's trailing "/**" matches zero segments, so literal file patterns like
// "./index.html" still match the file itself, and bare directories match their contents.
//
// The base directory is a literal path, not a glob — escape it so a workspace path
// containing glob characters ("app/[slug]", "Projects (old)") isn't read as a character
// class or group (tinyglobby passes cwd as a separate literal argument, never as pattern
// text). Leading ./ and ../ segments are consumed against configDir first, since ".."
// can't textually climb over an escaped segment.
const expandPattern = (pattern: string, configDir: string): string => {
  let result: string;
  if (isAbsolute(pattern)) {
    result = toPosix(pattern); // user-authored pattern text — keep its glob meaning
  } else {
    let base = resolve(configDir);
    let rest = toPosix(pattern);
    while (rest.startsWith("./") || rest.startsWith("../")) {
      if (rest.startsWith("./")) rest = rest.slice(2);
      else {
        base = dirname(base);
        rest = rest.slice(3);
      }
    }
    if (rest === "..") {
      base = dirname(base);
      rest = "";
    } else if (rest === ".") {
      rest = "";
    }
    const escapedBase = escapeGlob(toPosix(base));
    result = rest ? `${escapedBase}/${rest}` : escapedBase;
  }
  if (result.endsWith("/")) result = result.slice(0, -1);
  if (!result.endsWith("*")) result += "/**";
  return result;
};

/**
 * Build a matcher with the same semantics as the core's `resolveFiles` (tinyglobby):
 * patterns resolved against the config file's directory, directories expanded to their
 * contents, dot files excluded. Returns null when `include` is empty or absent — the
 * config governs no files, mirroring the plugin scanning nothing (the extension then
 * stays dormant for that config).
 */
export const createContentMatcher = (content: ContentConfig | undefined, configDir: string): ContentMatcher | null => {
  if (!content || content.include.length === 0) return null;
  const isIncluded = picomatch(
    content.include.map((p) => expandPattern(p, configDir)),
    MATCH_OPTIONS,
  );
  const exclude = content.exclude ?? [];
  const isExcluded = exclude.length
    ? picomatch(
        exclude.map((p) => expandPattern(p, configDir)),
        MATCH_OPTIONS,
      )
    : () => false;
  return (absPath) => {
    const p = toPosix(absPath);
    return isIncluded(p) && !isExcluded(p);
  };
};

/**
 * Order workspace config files by likelihood of governing `documentPath`: configs in an
 * ancestor directory of the document first (deepest first, so a package config beats the
 * monorepo root), then the rest by how much path they share with the document (a sibling
 * package's config whose `include` reaches up with `../` beats an unrelated one).
 * Same-directory configs tie-break in regexcss auto-discovery order (ts → mts → js →
 * mjs → cjs) so the extension reads the same config the plugin would; remaining ties
 * break lexicographically so the result is deterministic.
 */
export const orderConfigCandidates = (configFiles: string[], documentPath: string): string[] => {
  const docSegments = toPosix(documentPath).split("/");
  const rank = (configFile: string): [ancestor: number, depth: number] => {
    const dirSegments = toPosix(configFile).split("/").slice(0, -1);
    let common = 0;
    while (common < dirSegments.length && common < docSegments.length && dirSegments[common] === docSegments[common]) {
      common++;
    }
    // segment-wise comparison, so /repo/app never counts as an ancestor of /repo/app2/x
    const isAncestor = common === dirSegments.length && common < docSegments.length;
    return isAncestor ? [1, dirSegments.length] : [0, common];
  };
  return [...configFiles].sort((a, b) => {
    const [aAnc, aDepth] = rank(a);
    const [bAnc, bDepth] = rank(b);
    return bAnc - aAnc || bDepth - aDepth || extRank(a) - extRank(b) || (a < b ? -1 : a > b ? 1 : 0);
  });
};

// Same order as regexcss (unconfig) auto-discovery, so two configs in one directory
// resolve to the same file the Vite plugin loads.
const CONFIG_EXTS = ["ts", "mts", "js", "mjs", "cjs"];

const extRank = (configFile: string): number => {
  const i = CONFIG_EXTS.indexOf(configFile.slice(configFile.lastIndexOf(".") + 1));
  return i === -1 ? CONFIG_EXTS.length : i;
};
