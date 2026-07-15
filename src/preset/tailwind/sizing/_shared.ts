import { stringifyDeclarations } from "../../../core/stringify.ts";
import { rem } from "../../../helpers.ts";
import type { CSSObject, Rule } from "../../../types.ts";

// Shared builder for the sizing utilities (width / height / min-* / max-* / size).
// Every axis shares the same shape: a numeric spacing scale, fractions, and a set of
// keyword values. Only the keyword set, the `screen` value (100vw vs 100vh) and the
// emitted property differ per utility.

// integer or decimal, e.g. `4`, `0.5`, `.5`
const NUM = "(\\d+(?:\\.\\d+)?|\\.\\d+)";

// viewport keyword units shared by every axis (w-dvw, h-svh, ...)
const VIEWPORT = ["dvw", "dvh", "lvw", "lvh", "svw", "svh"];

// container scale (w-3xs ... w-7xl) → var(--<prefix>-<size>). The token names
// mirror Tailwind's theme tokens by default ("container"); the prefix is
// configurable per utility and the consumer defines the actual values.
const CONTAINER = ["3xs", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl"];

// fractions accept numerator < denominator with denominators up to this bound
const FRACTION_MAX_DENOMINATOR = 12;

// "base" → width/height (auto), "min" → min-* (auto), "max" → max-* (none).
type Kind = "base" | "min" | "max";

interface Options {
  /** value for the `screen` keyword: "100vw" for width axis, "100vh" for height. */
  screen?: string;
  /** "w" omits the `lh` keyword, "h" adds it (h-lh → 1lh). */
  axis: "w" | "h";
  /** enable the container scale with this CSS variable prefix (w-3xs ... w-7xl → var(--<prefix>-*)). */
  container?: string;
  /** largest value the numeric scale accepts, inclusive (default 96). Out-of-range values match no rule. */
  max?: number;
}

// Keyword → CSS value map for the given kind/axis.
const keywords = (kind: Kind, { screen, axis, container }: Options): Record<string, string> => {
  const kw: Record<string, string> = {
    full: "100%",
    min: "min-content",
    max: "max-content",
    fit: "fit-content",
    px: "1px",
  };
  if (screen) kw.screen = screen;
  // max-width/max-height take `none`; everything else takes `auto`.
  if (kind === "max") kw.none = "none";
  else kw.auto = "auto";
  if (axis === "h") kw.lh = "1lh";
  for (const u of VIEWPORT) kw[u] = `100${u}`;
  if (container) for (const c of CONTAINER) kw[c] = `var(--${container}-${c})`;
  return kw;
};

/**
 * Build the rule list for a sizing utility.
 *
 * @param prefix class-name prefix (`w`, `min-w`, `size`, ...)
 * @param kind   keyword flavour (controls auto vs none)
 * @param opts   per-axis `screen` value + axis marker + numeric cap
 * @param emit   maps a resolved CSS value to the emitted declaration(s)
 */
export const makeSizingRules = (
  prefix: string,
  kind: Kind,
  opts: Options,
  emit: (value: string) => CSSObject,
): Rule[] => {
  const max = opts.max ?? 96;
  const kw = keywords(kind, opts);
  // longest alternative first so multi-char keywords aren't shadowed
  const alt = Object.keys(kw)
    .sort((a, b) => b.length - a.length)
    .join("|");
  return [
    // numeric scale: w-4 → width: 1rem (1 unit = 0.25rem)
    [
      new RegExp(`^${prefix}-${NUM}$`),
      ([, num]) => (num && Number(num) <= max ? emit(rem(num)) : undefined),
      { samples: [{ class: `${prefix}-<num>`, style: stringifyDeclarations(emit("<num/4>rem")) }] },
    ],
    // fractions: w-1/2 → width: calc(1/2 * 100%)
    [
      new RegExp(`^${prefix}-(\\d+)\\/(\\d+)$`),
      ([, n, d]) =>
        n && d && Number(n) >= 1 && Number(n) < Number(d) && Number(d) <= FRACTION_MAX_DENOMINATOR
          ? emit(`calc(${n}/${d} * 100%)`)
          : undefined,
      { samples: [{ class: `${prefix}-<n>/<d>`, style: stringifyDeclarations(emit("calc(<n>/<d> * 100%)")) }] },
    ],
    // keywords: w-full, w-screen, w-min, w-dvh, ... enumerated straight from the regex.
    [new RegExp(`^${prefix}-(${alt})$`), ([, k]) => (k && kw[k] ? emit(kw[k]) : undefined)],
  ];
};
