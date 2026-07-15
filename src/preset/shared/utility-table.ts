import type { Rule } from "../../types.ts";

/**
 * A preset utility: a static rule list, or a factory taking that utility's
 * own options bag. The `never` parameter makes any concrete
 * `(options?: XOptions) => Rule[]` assignable under strict contravariance.
 */
export type Utility = Rule[] | ((options?: never) => Rule[]);

/** Ordered slug → utility map. Key order = cascade order. Slug = the utility's file basename. */
export type UtilityTable = Record<string, Utility>;

/** Per-utility options record for a table: one optional key per factory utility, typed from its signature. */
export type UtilityOptionsOf<T extends UtilityTable> = {
  [K in keyof T as T[K] extends (options?: never) => Rule[] ? K : never]?: T[K] extends (options?: infer O) => Rule[]
    ? O
    : never;
};

type UnionToIntersection<U> = (U extends unknown ? (x: U) => void : never) extends (x: infer I) => void ? I : never;

/**
 * One shared options bag for every utility — for categories with a single
 * cross-utility knob (`max`). The bag must satisfy the INTERSECTION of every
 * utility's options: if one utility grows a specific field, a bag carrying it
 * no longer type-checks here (route it via utility-path options instead).
 */
export const sharedUtilityOptions = <T extends UtilityTable>(
  utilities: T,
  options: UnionToIntersection<NonNullable<UtilityOptionsOf<T>[keyof UtilityOptionsOf<T>]>>,
): UtilityOptionsOf<T> =>
  Object.fromEntries(Object.keys(utilities).map((slug) => [slug, options])) as UtilityOptionsOf<T>;
