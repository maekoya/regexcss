import type { Rule } from "../../types.ts";
import type { PageOptionsOf, PageTable } from "./page-table.ts";

/**
 * One preset category: an ordered page table plus a router that derives
 * per-page option bags from the category's own options. The `never` parameter
 * makes any concrete `(options?: XOptions) => ...` router assignable under
 * strict contravariance (same trick as `Page`); the loose `object` return
 * keeps `PageOptionsOf<...>` return shapes assignable without demanding an
 * index signature. Each category pairs `pages` with `pageOptions` via its own
 * explicit return annotation (`PageOptionsOf<typeof xPages>`).
 */
export interface PresetCategory {
  pages: PageTable;
  pageOptions: (options?: never) => object;
}

/**
 * Category-name → category map. Key order = canonical rule order. Category
 * names and page slugs must not contain `/` — paths split on the first slash.
 */
export type PresetCategories = Record<string, PresetCategory>;

/** `"typography/line-clamp"`-style page paths, derived from the page tables. */
type PagePath<C extends PresetCategories> = {
  [K in keyof C & string]: `${K}/${keyof C[K]["pages"] & string}`;
}[keyof C & string];

/** Category names plus `category/page` paths. */
type Name<C extends PresetCategories> = (keyof C & string) | PagePath<C>;

/** Options accepted by one page path (`never` for static pages, which take none). */
type PathOptions<C extends PresetCategories, P> = P extends `${infer K}/${infer S}`
  ? K extends keyof C
    ? S extends keyof PageOptionsOf<C[K]["pages"]>
      ? PageOptionsOf<C[K]["pages"]>[S]
      : never
    : never
  : never;

/** Options keyed by category (routed per page) or by page path (overrides the derived bag). */
type OptionsMap<C extends PresetCategories> = {
  [K in keyof C]?: Parameters<C[K]["pageOptions"]>[0];
} & {
  [P in PagePath<C>]?: PathOptions<C, P>;
};

export interface PresetSelection<C extends PresetCategories> {
  /**
   * Categories and/or `category/page` paths, emitted in the order given
   * (affects cascade). Default: all categories in map order.
   */
  include?: Name<C>[];
  /** Names to drop: a category removes all of its pages, a path removes one page. Always wins over include. */
  exclude?: Name<C>[];
  /** Category options and/or page-path options, e.g. `{ sizing: { max: 64 }, "sizing/width": { max: 32 } }`. */
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

/** The category map of a preset, e.g. `PresetCategoriesOf<typeof tailwindPreset>`. */
export type PresetCategoriesOf<P extends AnyPreset> = P["categories"];
/** Name union of a preset: categories plus `category/page` paths. */
export type PresetNameOf<P extends AnyPreset> = Name<P["categories"]>;
/** The object-form selection accepted by a preset. */
export type PresetSelectionOf<P extends AnyPreset> = PresetSelection<P["categories"]>;
/** The per-category / per-page options map accepted by a preset. */
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

  // Expand a name to its page paths (a category expands to all of its pages, in table order).
  const pagePaths = (n: string): string[] => {
    if (n in table) return Object.keys(table[n].pages).map((slug) => `${n}/${slug}`);
    if (!n.includes("/")) throw new Error(`Unknown preset "${n}"${suffix}`);
    return [n];
  };

  const preset = (sel: PresetSelection<C> = {}): Rule[] => {
    // Guard plain-JS callers: an array would silently fall through to the
    // "include everything" default instead of selecting the given names.
    if (Array.isArray(sel)) {
      throw new TypeError(`Presets take a selection object — use { include: [...] }${suffix}`);
    }
    const include: readonly string[] = sel.include ?? Object.keys(table);
    const excluded = new Set((sel.exclude ?? []).flatMap(pagePaths));
    const seen = new Set<string>();
    const paths = include.flatMap(pagePaths).filter((path) => {
      if (excluded.has(path) || seen.has(path)) return false;
      seen.add(path);
      return true;
    });
    const options = (sel.options ?? {}) as Record<string, object | undefined>;
    return paths.flatMap((path) => {
      const slash = path.indexOf("/");
      const category = path.slice(0, slash);
      const slug = path.slice(slash + 1);
      const page = table[category]?.pages[slug];
      if (page === undefined) throw new Error(`Unknown preset page "${path}"${suffix}`);
      if (typeof page !== "function") return page;
      // Category options routed to this page by the category's deriver, then
      // page-path options shallow-merged on top (page keys win). Each value is
      // type-checked by the options map; the casts bridge the entry union.
      const derived = (table[category].pageOptions as (o?: object) => Record<string, object | undefined>)(
        options[category],
      )[slug];
      return page({ ...derived, ...options[path] } as never);
    });
  };

  return Object.assign(preset, { categories });
}
