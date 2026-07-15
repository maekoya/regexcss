import type { Rule } from "../../types.ts";

/**
 * A preset page: a static rule list, or a factory taking that page's own
 * options bag. The `never` parameter makes any concrete
 * `(options?: XOptions) => Rule[]` assignable under strict contravariance.
 */
export type Page = Rule[] | ((options?: never) => Rule[]);

/** Ordered page-slug → page map. Key order = cascade order. Slug = the page's file basename. */
export type PageTable = Record<string, Page>;

/** Per-page options record for a table: one optional key per factory page, typed from its signature. */
export type PageOptionsOf<P extends PageTable> = {
  [K in keyof P as P[K] extends (options?: never) => Rule[] ? K : never]?: P[K] extends (options?: infer O) => Rule[]
    ? O
    : never;
};

type UnionToIntersection<U> = (U extends unknown ? (x: U) => void : never) extends (x: infer I) => void ? I : never;

/**
 * One shared options bag for every page — for categories with a single
 * cross-page knob (`max`). The bag must satisfy the INTERSECTION of every
 * page's options: if one page grows a page-specific field, a bag carrying it
 * no longer type-checks here (route it via page-path options instead).
 */
export const sharedPageOptions = <P extends PageTable>(
  pages: P,
  options: UnionToIntersection<NonNullable<PageOptionsOf<P>[keyof PageOptionsOf<P>]>>,
): PageOptionsOf<P> => Object.fromEntries(Object.keys(pages).map((slug) => [slug, options])) as PageOptionsOf<P>;
