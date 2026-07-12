/**
 * A flat map of CSS property → value, e.g. `{ margin: "1rem", "background-color": "red" }`.
 *
 * Both camelCase (`backgroundColor`) and kebab-case (`"background-color"`) are accepted —
 * camelCase keys are normalized at stringify time. Values are emitted verbatim, including
 * units; no automatic `px` coercion is performed.
 */
export type CSSObject = Record<string, string>;

/**
 * Ordered list of CSS property → value pairs, e.g. `[["display", "-webkit-box"], ["display", "flex"]]`.
 *
 * Unlike {@link CSSObject}, the same property may appear more than once — use this when a
 * utility needs duplicate declarations for fallbacks. Keys are normalized like CSSObject keys.
 */
export type CSSEntries = Array<[property: string, value: string]>;

/**
 * Context passed to each rule handler so the handler can inspect the original token,
 * the post-variant residue, and the variant chain that produced it.
 */
export interface RuleContext {
  /** Original token as it appeared in source (e.g. `"md:hover:m-1"`). */
  rawSelector: string;
  /** Token after the variant chain has stripped its prefixes (e.g. `"m-1"`). */
  currentSelector: string;
  /** Variants applied to the token, in order from outermost to innermost. */
  variants: VariantHandlerResult[];
}

/**
 * Rule handler signature.
 *
 * Returning `undefined` skips this rule and lets the next matching one try, which is
 * useful for guards (e.g. only handle when a captured value is numerically valid).
 *
 * Handlers must be pure functions of their inputs: the generator memoizes the result
 * per token, so a handler that reads mutable external state may see stale output.
 */
export type RuleHandler = (match: RegExpMatchArray, ctx: RuleContext) => CSSObject | CSSEntries | undefined;

/**
 * Documentation metadata attached to a rule as an optional third tuple element.
 * Ignored by the matching engine; consumed by the docs enumerator (`regexcss docs`).
 */
/**
 * One documentation sample: a class pattern and the style it produces, shown
 * verbatim in docs output. Placeholders like `<num>` are display-only — samples are
 * not expanded or verified, they document the shape of a rule for a human reader.
 */
export interface RuleSample {
  /** Class pattern, e.g. `"mt-<num>"`. */
  class: string;
  /** Style the class produces, e.g. `"margin-top: <num/4>rem"`. */
  style: string;
}

export interface RuleMeta {
  /**
   * Documentation samples shown verbatim in docs output. When present, they replace
   * regex-derived enumeration for this rule (the rule is documented by its samples
   * rather than by listing every concrete class it matches).
   */
  samples?: RuleSample[];
  /** Docs grouping label (e.g. `"spacing"`). Rules without one render under "Rules". */
  category?: string;
  /**
   * Docs display name for the rule (preset rules use the corresponding Tailwind
   * utility name, e.g. `"margin"`). Falls back to the regex source when absent.
   */
  label?: string;
  /** Docs tags rendered as chips next to the rule (preset rules carry `"preset"`). */
  tags?: string[];
  /** Free-text note rendered under the rule in docs output (e.g. usage caveats). */
  note?: string;
  /**
   * Exclude this rule from docs output entirely. Use it when another rule's samples
   * already cover these classes, so the rule still works at runtime but is not listed
   * (and its classes are not attributed elsewhere).
   */
  hidden?: boolean;
}

/**
 * A single rule: a regex and a handler that produces a {@link CSSObject},
 * with optional {@link RuleMeta} for documentation output.
 */
export type Rule = [RegExp, RuleHandler] | [RegExp, RuleHandler, RuleMeta];

/**
 * Result of a variant matcher. The generator collects these in order during the variant
 * chain phase and uses them to wrap the final selector / at-rule output.
 */
export interface VariantHandlerResult {
  /** Token with this variant's prefix stripped — passed to the next variant or to rules. */
  matcher: string;
  /** Optional selector wrapper, e.g. `(s) => `${s}:hover`` or `(s) => `.group:hover ${s}``. */
  selector?: (sel: string) => string;
  /** Optional at-rule that wraps the produced rule, e.g. `"@media (--md)"`. */
  parent?: string;
  /**
   * Exclusivity group. Within one token's variant chain, at most one variant per group is
   * applied — a second match from the same group (e.g. `md:sm:` with both in
   * `"window-size"`) is skipped, the residue matches no rule, and the token is dropped
   * with a {@link GenerateWarning}. Stacking contradictory media queries is the use case.
   */
  group?: string;
}

/** Variant handler signature. Return `undefined` to leave the token unchanged. */
export type VariantHandler = (match: RegExpMatchArray, raw: string) => VariantHandlerResult | undefined;

/**
 * Documentation metadata for a variant, attached as an optional third tuple element.
 * Ignored by the matching engine; consumed by the docs enumerator (`regexcss docs`).
 */
export interface VariantMeta {
  /** Docs display name (defaults to the variant prefix, e.g. `"md"`). */
  label?: string;
  /** Exclusivity group shown as a chip in docs output (e.g. `"window-size"`). */
  group?: string;
  /** Free-text summary shown under the variant — what selector / at-rule it applies. */
  note?: string;
  /**
   * Example of the CSS the variant produces, shown verbatim in docs output.
   * `createVariant` fills this with a representative wrapped selector.
   */
  sample?: string;
}

/**
 * A single variant: a regex and a handler that yields a {@link VariantHandlerResult},
 * with optional {@link VariantMeta} for documentation output.
 */
export type Variant = [RegExp, VariantHandler] | [RegExp, VariantHandler, VariantMeta];

/** Glob patterns describing which source files to scan for utility class tokens. */
export interface ContentConfig {
  /** Files / directories to scan. Relative paths and root-external paths are both supported. */
  include: string[];
  /** Files / directories to skip even if matched by `include`. */
  exclude?: string[];
}

/**
 * Library configuration. Pass this to {@link createGenerator} (or `defineConfig`) to drive
 * the generator. All fields except `rules` are optional.
 */
export interface UserConfig {
  /**
   * User-defined utility rules. Each rule is a `[RegExp, handler]` tuple where the handler
   * receives the regex match array and returns a CSSObject (or CSSEntries), or `undefined`
   * to defer to the next matching rule.
   *
   * Definition order matters twice: earlier rules win when several match the same token,
   * and generated CSS is emitted in rule order — so later rules override earlier ones in
   * the cascade when both apply to the same element.
   */
  rules: Rule[];
  /**
   * Variant matchers applied to tokens before rule matching. Variants are recursively
   * applied head-to-tail until none match; each variant strips its own prefix and may wrap
   * the resulting selector and/or at-rule.
   *
   * Definition order doubles as cascade order: variant-wrapped output is emitted after the
   * base utilities, grouped by variant in definition order. Define responsive breakpoints
   * smallest-first (`sm`, `md`, `lg`) for mobile-first overrides.
   */
  variants?: Variant[];
  /**
   * Wraps the generated declarations in `@layer <layerName> { ... }`. Use this to control
   * cascade order against other CSS in the project. Omit to skip the layer wrap.
   */
  layerName?: string;
  /**
   * Required namespace prefix for generated classes (e.g. `"tw-"`). When set, tokens not
   * starting with this prefix are silently skipped (strict mode). The prefix is outermost
   * and variants live inside it — `tw-md:hover:m-4`.
   */
  prefix?: string;
  /**
   * `@custom-media` declarations emitted at the top of generated CSS. Each entry becomes
   * `@custom-media --<name> <query>;`. Requires LightningCSS's `drafts.customMedia: true`
   * flag in `vite.config.ts` to be resolved by the bundler.
   */
  customMedia?: Record<string, string>;
  /** Source files to scan for utility tokens. */
  content?: ContentConfig;
  /**
   * Custom token extractor. The default matches `[\w:.\-/]+` from the full source text.
   * Override to target specific syntax (e.g. `class="..."` attributes only).
   */
  extractor?: (code: string) => Iterable<string>;
}

/**
 * `UserConfig` with all defaults applied. Returned via `Generator.config`. Useful for
 * introspecting effective settings from plugins or tooling.
 */
export interface ResolvedConfig {
  rules: Rule[];
  variants: Variant[];
  layerName: string | undefined;
  prefix: string;
  customMedia: Record<string, string>;
  content: ContentConfig;
  extractor: (code: string) => Iterable<string>;
}

/** A per-token diagnostic produced during generation (e.g. a variant group collision). */
export interface GenerateWarning {
  /** The raw token the warning is about, as it appeared in source. */
  token: string;
  /** Human-readable description; the Vite plugin forwards it to the environment logger. */
  message: string;
}

/** Output of a single `Generator.generate` call. */
export interface GenerateResult {
  /** The fully-rendered CSS string. May include `@custom-media`, `@layer`, etc. */
  css: string;
  /** Set of tokens that successfully matched a rule. Useful for debugging / coverage. */
  matched: Set<string>;
  /**
   * Tokens that passed the prefix filter but matched no rule. With the default extractor
   * this is noisy (it contains every identifier-like word in the scanned sources), so it
   * is mainly useful with a targeted extractor or for ad-hoc debugging.
   */
  unmatched: Set<string>;
  /**
   * Per-token diagnostics: variant-group collisions (`md:sm:` style) and tokens whose
   * variants applied but whose remainder matched no rule (`hover:bg-rose-500` typos).
   * Unlike `unmatched` these are high-signal: the token clearly used variant syntax.
   */
  warnings: GenerateWarning[];
}

/** Per-call options for {@link Generator.generate}. */
export interface GenerateOptions {
  /**
   * Override `config.layerName` for this call only. Pass `""` to disable layer wrapping
   * entirely for this call. Useful when the Vite plugin needs different layers for
   * different `@import "regexcss" layer(<name>);` sites in the same source.
   */
  layerName?: string;
}

/**
 * What a single token produces, without the `@layer` / `@custom-media` wrappers that
 * {@link Generator.generate} adds. Returned by {@link Generator.explain} — handy for
 * editor tooling (hover previews) that wants just the rule for one class.
 */
export interface ExplainResult {
  /** The generated selector, e.g. `".md\\:m-4"` (variant selector transforms applied). */
  selector: string;
  /** The declarations, e.g. `"margin: 1rem;"` — no selector or at-rule wrappers. */
  declarations: string;
  /** At-rule wrappers contributed by variants, outermost first (e.g. `["@media (--md)"]`). */
  parents: string[];
}

/**
 * Stateful generator built from a {@link UserConfig}. Call `generate(tokens)` to produce
 * CSS; the same generator can be reused across many calls.
 */
export interface Generator {
  /** Generate CSS for the given iterable of utility tokens. */
  generate(tokens: Iterable<string>, options?: GenerateOptions): Promise<GenerateResult>;
  /**
   * Explain a single token: the selector + declarations + at-rule parents it produces,
   * unwrapped. Returns `undefined` when the token matches no rule (or its variant chain
   * collides). Synchronous — no scanning or file IO.
   */
  explain(token: string): ExplainResult | undefined;
  /** Effective config with defaults applied. */
  readonly config: ResolvedConfig;
}
