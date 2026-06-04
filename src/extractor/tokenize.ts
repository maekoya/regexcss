const DEFAULT_TOKEN_RE = /[\w:.\-/]+/g;

export const defaultExtractor = (code: string): string[] => {
  const matches = code.matchAll(DEFAULT_TOKEN_RE);
  const out: string[] = [];
  for (const m of matches) out.push(m[0]);
  return out;
};
