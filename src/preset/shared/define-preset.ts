import type { Rule } from "../../types.ts";
import type { UtilityOptionsOf, UtilityTable } from "./utility-table.ts";

/**
 * One preset category: an ordered utility table, plus — only for categories
 * with a genuinely shared knob (e.g. sizing's `max`) — a router that derives
 * per-utility option bags from the category's own options. Categories without
 * a router take no category-level options; their factory utilities are tuned
 * via `"category/utility"` option keys instead. The `never` parameter makes
 * any concrete `(options?: XOptions) => ...` router assignable under strict
 * contravariance (same trick as `Utility`); the loose `object` return keeps
 * `UtilityOptionsOf<...>` return shapes assignable without demanding an index
 * signature.
 */
export interface PresetCategory {
  utilities: UtilityTable;
  utilityOptions?: (options?: never) => object;
}

/**
 * Category-name → category map. Key order = canonical rule order. Category
 * names and utility slugs must not contain `/` — paths split on the first
 * slash (validated by `definePreset`).
 */
export type PresetCategories = Record<string, PresetCategory>;

/** `"typography/line-clamp"`-style utility paths, derived from the utility tables. */
type UtilityPath<C extends PresetCategories> = {
  [K in keyof C & string]: `${K}/${keyof C[K]["utilities"] & string}`;
}[keyof C & string];

/** Category names plus `category/utility` paths. */
type Name<C extends PresetCategories> = (keyof C & string) | UtilityPath<C>;

/** Options accepted by one utility path (`never` for static utilities, which take none). */
type PathOptions<C extends PresetCategories, P> = P extends `${infer K}/${infer S}`
  ? K extends keyof C
    ? S extends keyof UtilityOptionsOf<C[K]["utilities"]>
      ? UtilityOptionsOf<C[K]["utilities"]>[S]
      : never
    : never
  : never;

/** The category-level options of one category (`never` when it has no router). */
type CategoryOptions<Cat> = Cat extends { utilityOptions: (options?: infer O) => object } ? O : never;

/**
 * Options keyed by category (only categories with a router) or by utility
 * path (overrides the derived bag key-by-key).
 */
type OptionsMap<C extends PresetCategories> = {
  [K in keyof C as [CategoryOptions<C[K]>] extends [never] ? never : K]?: CategoryOptions<C[K]>;
} & {
  [P in UtilityPath<C>]?: PathOptions<C, P>;
};

export interface PresetSelection<C extends PresetCategories> {
  /**
   * Categories and/or `category/utility` paths, emitted in the order given
   * (affects cascade). Default: all categories in map order.
   */
  include?: Name<C>[];
  /** Names to drop: a category removes all of its utilities, a path removes one utility. Always wins over include. */
  exclude?: Name<C>[];
  /** Category options and/or utility-path options, e.g. `{ sizing: { max: 64 }, "sizing/width": { max: 32 } }`. */
  options?: OptionsMap<C>;
}

/** What `definePreset` returns: a callable selection plus its category map. */
export interface Preset<C extends PresetCategories> {
  (selection?: PresetSelection<C>): Rule[];
  readonly categories: C;
}

// Structural handle for the extraction types. `Preset<C>` uses C in a
// contravariant position (the call signature), so `P extends
// Preset<PresetCategories>` would reject every concrete preset; matching on
// the `categories` property alone accepts them all.
interface AnyPreset {
  categories: PresetCategories;
}

/** Name union of a preset: categories plus `category/utility` paths. */
export type PresetNameOf<P extends AnyPreset> = Name<P["categories"]>;
/** The object-form selection accepted by a preset. */
export type PresetSelectionOf<P extends AnyPreset> = PresetSelection<P["categories"]>;
/** The per-category / per-utility options map accepted by a preset. */
export type PresetOptionsMapOf<P extends AnyPreset> = OptionsMap<P["categories"]>;

/**
 * Build a preset function from a category map. Key order = canonical rule
 * order: it drives first-match-wins and cascade output order, so the map is
 * the single source of truth for the name unions, the default ordering, and
 * option routing. `name` is used only to tag error messages.
 */
export function definePreset<C extends PresetCategories>(categories: C, name?: string): Preset<C> {
  const table: PresetCategories = categories;
  const suffix = name === undefined ? "" : ` (${name})`;

  for (const category of Object.keys(table)) {
    if (category.includes("/")) {
      throw new Error(`Preset category name "${category}" must not contain "/"${suffix}`);
    }
  }

  // Expand a name to its utility paths (a category expands to all of its
  // utilities, in table order). Every name — include and exclude alike — is
  // validated here, with own-key lookups so prototype members ("toString",
  // ...) are rejected like any other unknown name.
  const utilityPaths = (n: string): string[] => {
    if (Object.hasOwn(table, n)) return Object.keys(table[n].utilities).map((slug) => `${n}/${slug}`);
    const slash = n.indexOf("/");
    if (slash === -1) throw new Error(`Unknown preset "${n}"${suffix}`);
    const category = n.slice(0, slash);
    const slug = n.slice(slash + 1);
    if (!Object.hasOwn(table, category) || !Object.hasOwn(table[category].utilities, slug)) {
      throw new Error(`Unknown preset utility "${n}"${suffix}`);
    }
    return [n];
  };

  const preset = (sel: PresetSelection<C> = {}): Rule[] => {
    // Guard plain-JS callers: an array would silently fall through to the
    // "include everything" default instead of selecting the given names.
    if (Array.isArray(sel)) {
      throw new TypeError(`Presets take a selection object — use { include: [...] }${suffix}`);
    }
    const include: readonly string[] = sel.include ?? Object.keys(table);
    const excluded = new Set((sel.exclude ?? []).flatMap(utilityPaths));
    const seen = new Set<string>();
    const paths = include.flatMap(utilityPaths).filter((path) => {
      if (excluded.has(path) || seen.has(path)) return false;
      seen.add(path);
      return true;
    });
    const options = (sel.options ?? {}) as Record<string, Record<string, unknown> | undefined>;
    // Route category options to utilities once per category, not once per utility.
    const derivedByCategory = new Map<string, Record<string, object | undefined>>();
    const derivedFor = (category: string): Record<string, object | undefined> => {
      let bag = derivedByCategory.get(category);
      if (bag === undefined) {
        const route = table[category].utilityOptions as
          | ((o?: object) => Record<string, object | undefined>)
          | undefined;
        bag = route?.(options[category]) ?? {};
        derivedByCategory.set(category, bag);
      }
      return bag;
    };
    return paths.flatMap((path) => {
      const slash = path.indexOf("/");
      const category = path.slice(0, slash);
      const slug = path.slice(slash + 1);
      const utility = table[category].utilities[slug]; // validated by utilityPaths
      if (typeof utility !== "function") return utility;
      // Utility-path options override the derived category bag key-by-key.
      // Explicit `undefined` values are skipped so `{ max: cond ? 32 : undefined }`
      // cannot clobber a category option back to the factory default.
      const derived = derivedFor(category)[slug];
      const overrides = options[path];
      let bag = derived;
      if (overrides !== undefined) {
        const merged: Record<string, unknown> = { ...derived };
        for (const [key, value] of Object.entries(overrides)) {
          if (value !== undefined) merged[key] = value;
        }
        bag = merged;
      }
      return utility(bag as never);
    });
  };

  return Object.assign(preset, { categories });
}
