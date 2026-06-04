// One CSS-ident segment: starts with a letter/`_`, or `-` followed by a
// letter/`_`/`-` (so `-webkit` and `--foo` are fine, but `-1` and a lone `-`
// are not — a digit may never start an ident). Stays ASCII-only on purpose;
// this is a typo guard, not a full CSS tokenizer (escapes / non-ASCII are out
// of scope). Dots join segments for nested layers, e.g. `website.utilities`.
const SEG = String.raw`(?:[A-Za-z_]|-[A-Za-z_-])[A-Za-z0-9_-]*`;
// Valid `@layer` name: dot-separated CSS identifiers. Guards against typos /
// stray characters that would otherwise emit broken or unintended CSS.
const LAYER_NAME_RE = new RegExp(String.raw`^${SEG}(?:\.${SEG})*$`);

// Wrap a CSS body in `@layer <name> { ... }`. Validates the name whenever one is
// given (even for an empty body, so config typos surface immediately). Returns
// the body unchanged when `layerName` is falsy or — for a valid name — empty.
export const renderLayer = (css: string, layerName: string | undefined): string => {
  if (!layerName) return css;
  if (!LAYER_NAME_RE.test(layerName)) {
    throw new Error(
      `Invalid @layer name ${JSON.stringify(layerName)}: expected dot-separated CSS identifiers (letters, digits, "-", "_"), each segment starting with a letter, "-" or "_".`,
    );
  }
  if (css.length === 0) return css;
  const indented = css
    .split("\n")
    .map((line) => (line.length > 0 ? `  ${line}` : line))
    .join("\n");
  return `@layer ${layerName} {\n${indented}\n}`;
};
