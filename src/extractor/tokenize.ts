// A class token: word chars plus `:` `.` `-` `/` `~`. Symbol prefixes that stay part
// of the token (`-m-4` negatives, `~m-1/2` custom markers) work without a custom
// extractor; other symbols (`!` `@` `$` …) still split tokens.
const DEFAULT_TOKEN_RE = /[\w:.\-/~]+/g;

export const defaultExtractor = (code: string): string[] => {
  const matches = code.matchAll(DEFAULT_TOKEN_RE);
  const out: string[] = [];
  for (const m of matches) out.push(m[0]);
  return out;
};
