// A tiny, best-effort regex enumerator used to derive documentation classes for
// rules that don't provide `samples`. It understands the finite subset of regex the
// preset / typical user rules use and gives up (returns `undefined`) on anything
// open-ended, so the caller can ask for `samples` instead.

const MAX_CHAR_CLASS_SIZE = 16;
// Ceiling on how many candidates a single finite pattern may expand to. It exists
// purely to bound memory/CPU — it is set high enough that realistic finite rules
// expand fully and the caller's per-rule display cap does the trimming. A pattern
// that would exceed it is treated as effectively unbounded (→ `undefined`).
const MAX_ENUMERATION = 10_000;

/** Thrown internally when a regex uses a construct the expander cannot enumerate. */
class Bail extends Error {}

/**
 * Best-effort expansion of a rule regex into the finite set of strings it accepts.
 * Handles anchors, `(a|b)` groups, `?`, small character classes, and `\d`/`\d+`
 * (bounded by `maxNumber`). Returns `undefined` when the pattern is too open-ended
 * (`\w`, `.`, `*`, `{n,}`, lookaround, negated classes, ...) or expands past
 * {@link MAX_ENUMERATION} candidates.
 */
export const expandRegexSource = (source: string, maxNumber: number): string[] | undefined => {
  let src = source;
  if (src.startsWith("^")) src = src.slice(1);
  if (src.endsWith("$") && !src.endsWith("\\$")) src = src.slice(0, -1);
  let pos = 0;

  const parseCharClass = (): string[] => {
    pos++; // consume "["
    if (src[pos] === "^") throw new Bail();
    const readChar = (): string => {
      let ch = src[pos];
      if (ch === undefined) throw new Bail();
      if (ch === "\\") {
        ch = src[pos + 1];
        // \d, \w, \s etc. inside a class are open-ended; escaped punctuation is literal
        if (ch === undefined || /[A-Za-z0-9]/.test(ch)) throw new Bail();
        pos++;
      }
      pos++;
      return ch;
    };
    const chars: string[] = [];
    while (src[pos] !== "]") {
      const ch = readChar();
      if (src[pos] === "-" && src[pos + 1] !== "]") {
        pos++; // consume "-"
        const end = readChar();
        const lo = ch.charCodeAt(0);
        const hi = end.charCodeAt(0);
        if (hi < lo || hi - lo + 1 > MAX_CHAR_CLASS_SIZE) throw new Bail();
        for (let c = lo; c <= hi; c++) chars.push(String.fromCharCode(c));
      } else {
        chars.push(ch);
      }
      if (chars.length > MAX_CHAR_CLASS_SIZE) throw new Bail();
    }
    pos++; // consume "]"
    return chars;
  };

  const parseAtom = (): { values: string[]; digitClass: boolean } => {
    const c = src[pos];
    if (c === "(") {
      pos++;
      if (src.startsWith("?:", pos)) pos += 2;
      else if (src[pos] === "?") throw new Bail(); // lookaround / named group
      const values = parseAlternation();
      if (src[pos] !== ")") throw new Bail();
      pos++;
      return { values, digitClass: false };
    }
    if (c === "[") return { values: parseCharClass(), digitClass: false };
    if (c === "\\") {
      const next = src[pos + 1];
      if (next === "d") {
        pos += 2;
        const upper = Math.min(9, maxNumber);
        return { values: Array.from({ length: upper + 1 }, (_, n) => String(n)), digitClass: true };
      }
      // \w, \s, \b, backreferences, ... are open-ended; escaped punctuation is literal
      if (next === undefined || /[A-Za-z0-9]/.test(next)) throw new Bail();
      pos += 2;
      return { values: [next], digitClass: false };
    }
    if (c === undefined || "*+?{.)".includes(c)) throw new Bail();
    pos++;
    return { values: [c], digitClass: false };
  };

  const parseQuantified = (): string[] => {
    const { values, digitClass } = parseAtom();
    const q = src[pos];
    if (q === "?") {
      pos++;
      return ["", ...values];
    }
    if (q === "+") {
      pos++;
      // only \d+ has a sensible finite reading: the integers 0..maxNumber
      if (!digitClass) throw new Bail();
      return Array.from({ length: maxNumber + 1 }, (_, n) => String(n));
    }
    if (q === "*" || q === "{") throw new Bail();
    return values;
  };

  const parseSequence = (): string[] => {
    let results = [""];
    while (pos < src.length && src[pos] !== "|" && src[pos] !== ")") {
      const atom = parseQuantified();
      const next: string[] = [];
      for (const r of results) for (const a of atom) next.push(r + a);
      if (next.length > MAX_ENUMERATION) throw new Bail();
      results = next;
    }
    return results;
  };

  const parseAlternation = (): string[] => {
    const branches = parseSequence();
    while (src[pos] === "|") {
      pos++;
      branches.push(...parseSequence());
      if (branches.length > MAX_ENUMERATION) throw new Bail();
    }
    return branches;
  };

  try {
    const values = parseAlternation();
    if (pos !== src.length) throw new Bail();
    return [...new Set(values)];
  } catch (e) {
    if (e instanceof Bail) return undefined;
    throw e;
  }
};
