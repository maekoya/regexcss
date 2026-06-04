/**
 * A flat map of CSS property → value, e.g. `{ margin: "1rem", "background-color": "red" }`.
 *
 * Both camelCase (`backgroundColor`) and kebab-case (`"background-color"`) are accepted —
 * camelCase keys are normalized at stringify time. Values are emitted verbatim, including
 * units; no automatic `px` coercion is performed.
 */
export type CSSObject = Record<string, string>;

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
 */
export type RuleHandler = (match: RegExpMatchArray, ctx: RuleContext) => CSSObject | undefined;

/** A single rule: a regex and a handler that produces a {@link CSSObject}. */
export type Rule = [RegExp, RuleHandler];

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
}

/** Variant handler signature. Return `undefined` to leave the token unchanged. */
export type VariantHandler = (match: RegExpMatchArray, raw: string) => VariantHandlerResult | undefined;

/** A single variant: a regex and a handler that yields a {@link VariantHandlerResult}. */
export type Variant = [RegExp, VariantHandler];

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
   * receives the regex match array and returns a CSSObject, or `undefined` to defer to the
   * next matching rule.
   */
  rules: Rule[];
  /**
   * Variant matchers applied to tokens before rule matching. Variants are recursively
   * applied head-to-tail until none match; each variant strips its own prefix and may wrap
   * the resulting selector and/or at-rule.
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

/** Output of a single `Generator.generate` call. */
export interface GenerateResult {
  /** The fully-rendered CSS string. May include `@custom-media`, `@layer`, etc. */
  css: string;
  /** Set of tokens that successfully matched a rule. Useful for debugging / coverage. */
  matched: Set<string>;
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
 * Stateful generator built from a {@link UserConfig}. Call `generate(tokens)` to produce
 * CSS; the same generator can be reused across many calls.
 */
export interface Generator {
  /** Generate CSS for the given iterable of utility tokens. */
  generate(tokens: Iterable<string>, options?: GenerateOptions): Promise<GenerateResult>;
  /** Effective config with defaults applied. */
  readonly config: ResolvedConfig;
}
