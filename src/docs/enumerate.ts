import { matchRule } from "../core/rules.ts";
import { stringifyDeclarations } from "../core/stringify.ts";
import { normalizeVariants } from "../core/variants.ts";
import type { RuleContext, UserConfig } from "../types.ts";
import { expandRegexSource } from "./regex-expand.ts";

/** One documented class: its (prefixed) name and the declarations it generates. */
export interface DocClass {
  className: string;
  /** Generated declarations, e.g. `"margin-top: 1rem;"` — no selector or at-rule wrappers. */
  css: string;
}

/** Docs entry for a single rule, in rule definition order. */
export interface DocRule {
  /** The rule's regex source, shown alongside (or, without a label, as) the rule heading. */
  source: string;
  /** Display name from {@link RuleMeta.label}; docs fall back to `source` when absent. */
  label: string | undefined;
  /** Grouping label from {@link RuleMeta.category}, if any. */
  category: string | undefined;
  /** Tags from {@link RuleMeta.tags} (preset rules carry `"preset"`). */
  tags: string[];
  /** Free-text note from {@link RuleMeta.note}, rendered under the rule. */
  note: string | undefined;
  /** Classes attributed to this rule: verbatim samples, or classes derived from the regex. */
  classes: DocClass[];
  /** `false` when the rule has no samples and its regex could not be expanded. */
  enumerable: boolean;
}

/** Docs entry for a single variant — an overview, no per-class combinations. */
export interface DocVariant {
  /** Display name from {@link VariantMeta.label}; falls back to the regex source. */
  label: string;
  /** The variant's regex source (e.g. `"^md:"`), shown for context. */
  source: string;
  /** Exclusivity group from {@link VariantMeta.group}, if any. */
  group: string | undefined;
  /** Free-text summary from {@link VariantMeta.note}, if any. */
  note: string | undefined;
  /** Example output from {@link VariantMeta.sample}, if any. */
  sample: string | undefined;
}

export interface DocsData {
  rules: DocRule[];
  variants: DocVariant[];
  warnings: string[];
}

export interface EnumerateOptions {
  /**
   * Upper bound used when the regex fallback expands `\d` / `\d+` (inclusive, default 12).
   * A docs-only knob — it does not affect runtime matching. Rules with `samples` ignore it.
   */
  maxNumber?: number;
  /**
   * Largest number of classes documented per rule when enumerating from a regex
   * (default 100). Rules that match more are truncated with a warning. Pass `0` for
   * no cap. Rules with `samples` ignore it.
   */
  maxClassesPerRule?: number;
  /**
   * Ignore `samples` and always enumerate concrete class names from every rule's regex.
   * Use it when you need real class names (e.g. editor autocomplete) rather than the
   * compact sample patterns docs output prefers.
   */
  concrete?: boolean;
}

const DEFAULT_MAX_CLASSES_PER_RULE = 100;

/**
 * Enumerate the documentable classes of a config, in rule definition order.
 *
 * A rule with `samples` is documented by those samples verbatim (each becomes a
 * `class → style` row exactly as authored, with `config.prefix` prepended). A rule
 * without samples is enumerated from its regex: every candidate is verified against
 * the full rule list with {@link matchRule}, attributed to the rule that actually wins
 * at runtime (first match), and deduplicated globally. Candidates whose winning rule
 * is documented by its own samples (or hidden) are skipped so the two never mix. Each
 * regex-enumerated rule is capped at `maxClassesPerRule` rows (with a warning).
 */
export const enumerateClasses = (config: UserConfig, options: EnumerateOptions = {}): DocsData => {
  const maxNumber = options.maxNumber ?? 12;
  const rawCap = options.maxClassesPerRule ?? DEFAULT_MAX_CLASSES_PER_RULE;
  const cap = rawCap > 0 ? rawCap : Number.POSITIVE_INFINITY; // 0 (or less) = no cap
  const prefix = config.prefix ?? "";
  const rules = config.rules;
  const warnings: string[] = [];
  const seen = new Set<string>();

  // one record per rule (parallel index with `rules` / `docRules`) so the sample /
  // hidden flags and the running match count travel together
  const perRule = rules.map(([, , meta]) => ({
    hasSamples: (meta?.samples?.length ?? 0) > 0,
    hidden: meta?.hidden === true,
    matched: 0, // classes matched (whether shown or capped) — drives the truncation warning
  }));

  const docRules: DocRule[] = rules.map(([re, , meta]) => ({
    source: re.source,
    label: meta?.label,
    category: meta?.category,
    tags: meta?.tags ?? [],
    note: meta?.note,
    classes: [],
    enumerable: true,
  }));

  rules.forEach(([re, , meta], index) => {
    const docRule = docRules[index];
    if (!docRule || perRule[index]?.hidden) return; // hidden rules collect no classes and are dropped below

    // samples: shown verbatim, attributed to their own rule (skipped in concrete mode,
    // which always enumerates real class names from the regex instead)
    const samples = meta?.samples;
    if (!options.concrete && samples && samples.length > 0) {
      for (const s of samples) docRule.classes.push({ className: prefix + s.class, css: s.style });
      return;
    }

    // no samples: best-effort enumerate from the regex, verified against all rules
    const candidates = expandRegexSource(re.source, maxNumber);
    if (candidates === undefined) {
      warnings.push(
        `rule #${index} (/${re.source}/): could not be enumerated from its regex; add \`samples\` to its rule meta`,
      );
      docRule.enumerable = false;
      return;
    }

    for (const candidate of candidates) {
      if (seen.has(candidate)) continue;
      const ctx: RuleContext = { rawSelector: candidate, currentSelector: candidate, variants: [] };
      const match = matchRule(candidate, rules, ctx);
      const winner = match && perRule[match.index];
      // drop non-matches and hidden rules; outside concrete mode, also don't leak concrete
      // classes into a sample-documented rule (in concrete mode we want exactly those)
      if (!match || !winner || winner.hidden || (!options.concrete && winner.hasSamples)) continue;
      seen.add(candidate);
      const shown = winner.matched;
      winner.matched = shown + 1;
      // keep matching (so the count is accurate) but stop adding rows past the cap
      if (shown < cap) {
        docRules[match.index]?.classes.push({ className: prefix + candidate, css: stringifyDeclarations(match.css) });
      }
    }
  });

  // warn (but keep the classes shown) when a rule was truncated to the cap
  if (Number.isFinite(cap)) {
    perRule.forEach(({ matched }, i) => {
      if (matched > cap) {
        warnings.push(
          `rule #${i} (/${docRules[i]?.source}/): capped at ${cap} of ${matched} classes in the docs; add \`samples\` to document it compactly`,
        );
      }
    });
  }

  // variants are documented by an overview only — no class combinations
  // (normalized first: object-form variants carry their meta in the built tuple)
  const variants: DocVariant[] = normalizeVariants(config.variants ?? []).map(([re, , meta]) => ({
    label: meta?.label ?? re.source,
    source: re.source,
    group: meta?.group,
    note: meta?.note,
    sample: meta?.sample,
  }));

  return { rules: docRules.filter((_, i) => !perRule[i]?.hidden), variants, warnings };
};
