import { createGenerator, enumerateClasses } from "regexcss";
import type { DocClass, Generator } from "regexcss";
import { loadUserConfig } from "regexcss/config";
import { createContentMatcher, type ContentMatcher } from "./content.ts";
import { formatExplainCss } from "./format.ts";

/** A completion candidate: a concrete class, its declarations, and the rule to preview. */
export interface CompletionEntry extends DocClass {
  /**
   * The rule as the generator emits it — escaped selector (`.w-1\/2`), one declaration
   * per line, rem values annotated with px — formatted the same way as the hover.
   */
  preview: string;
}

/** Everything the providers need, derived from one config load. */
export interface RegexcssState {
  /** Per-token introspection for hover. */
  generator: Generator;
  /** Concrete class names + their CSS, for completion. */
  completions: CompletionEntry[];
  /** The config source that was loaded (for status / logging). */
  source: string | undefined;
  /** Which files this config governs (its content.include/exclude); null = empty include = dormant. */
  matches: ContentMatcher | null;
}

/**
 * Load the regexcss config from `root` and build the state. Returns null when no
 * config is found (the extension then stays dormant for that folder). `configPath`
 * (relative to root) overrides auto-discovery when set.
 */
export const loadState = async (root: string, configPath?: string): Promise<RegexcssState | null> => {
  const { config, sources } = await loadUserConfig(root, configPath || undefined);
  if (!config) return null;
  const generator = createGenerator(config);
  // concrete class names (samples ignored) so completion offers real, insertable classes
  const { rules } = enumerateClasses(config, { concrete: true, maxNumber: 12 });
  const completions = buildCompletions(
    generator,
    rules.flatMap((r) => r.classes),
  );
  const matches = createContentMatcher(config.content, root);
  return { generator, completions, source: sources[0], matches };
};

/**
 * Turn enumerated classes into completion entries: drop noisy decimals, dedupe by class
 * name, and render each preview through `explain` so it matches what the hover shows.
 */
export const buildCompletions = (generator: Generator, classes: DocClass[]): CompletionEntry[] =>
  dedupeByClassName(classes.filter((c) => !isNoisyDecimal(c.className))).map((c) => {
    const res = generator.explain(c.className);
    return { ...c, preview: res ? formatExplainCss(res) : `.${c.className} { ${c.css} }` };
  });

// Concrete regex enumeration produces every decimal (m-0.0, m-0.1, …); keep only
// integer and half-step values so completion offers a clean, Tailwind-like scale.
const isNoisyDecimal = (name: string): boolean => /\.\d/.test(name) && !name.endsWith(".5");

const dedupeByClassName = (classes: DocClass[]): DocClass[] => {
  const seen = new Set<string>();
  const out: DocClass[] = [];
  for (const c of classes) {
    if (seen.has(c.className)) continue;
    seen.add(c.className);
    out.push(c);
  }
  return out;
};
