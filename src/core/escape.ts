const NEEDS_ESCAPE = /[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~]/g;

// A CSS ident may not start with a digit — `.2xl\:m-1` is an invalid selector.
// A leading digit (optionally after a leading `-`) is hex-escaped the way
// `CSS.escape` does it: `2xl` → `\32 xl` (digits 0–9 are U+0030–U+0039, so the
// escape is always `\3<digit> `; the trailing space ends the escape sequence).
const LEADING_DIGIT = /^(-?)(\d)/;

export const escapeSelector = (raw: string): string => {
  return raw.replace(NEEDS_ESCAPE, (m) => `\\${m}`).replace(LEADING_DIGIT, (_, dash, digit) => `${dash}\\3${digit} `);
};
