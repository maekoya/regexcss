import { createGenerator, enumerateClasses } from "regexcss";
import type { DocClass, Generator } from "regexcss";
import { loadUserConfig } from "regexcss/config";

/** Everything the providers need, derived from one config load. */
export interface RegexcssState {
  /** Per-token introspection for hover. */
  generator: Generator;
  /** Concrete class names + their CSS, for completion. */
  completions: DocClass[];
  /** The config source that was loaded (for status / logging). */
  source: string | undefined;
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
  const classes = rules.flatMap((r) => r.classes).filter((c) => !isNoisyDecimal(c.className));
  const completions = dedupeByClassName(classes);
  return { generator, completions, source: sources[0] };
};

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
