// Pure text helpers (no vscode dependency) so they can be unit-tested directly.

// Characters that make up a class token — same set as regexcss's defaultExtractor
// (`/[\w:.\-/]+/g`): word chars plus `:` `.` `-` `/`.
const TOKEN_CHAR = /[\w:./-]/;

export interface TokenSpan {
  text: string;
  /** Column of the first character (inclusive). */
  start: number;
  /** Column just past the last character (exclusive). */
  end: number;
}

/**
 * The class-like token that the cursor at `character` sits on/next to, expanding
 * left and right over {@link TOKEN_CHAR}. Returns undefined when the cursor is not
 * on a token.
 */
export const tokenAt = (line: string, character: number): TokenSpan | undefined => {
  let start = character;
  let end = character;
  while (start > 0 && TOKEN_CHAR.test(line[start - 1] ?? "")) start--;
  while (end < line.length && TOKEN_CHAR.test(line[end] ?? "")) end++;
  if (start === end) return undefined;
  return { text: line.slice(start, end), start, end };
};

const escapeRe = (s: string): string => s.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&");

/**
 * If the text before the cursor sits inside an open class-attribute string
 * (`class="…`, `className="…`, etc.), return the value typed so far and the current
 * word (the token after the last whitespace). Returns undefined otherwise.
 */
export const classAttributeContext = (
  before: string,
  attributes: string[],
): { value: string; word: string } | undefined => {
  if (attributes.length === 0) return undefined;
  const attrs = attributes.map(escapeRe).join("|");
  // <attr> = <quote> <chars-without-a-closing-quote> <cursor>
  const re = new RegExp(`(?:${attrs})\\s*=\\s*(["'\\\`])((?:(?!\\1).)*)$`);
  const m = before.match(re);
  if (!m) return undefined;
  const value = m[2] ?? "";
  const word = value.split(/\s+/).pop() ?? "";
  return { value, word };
};
