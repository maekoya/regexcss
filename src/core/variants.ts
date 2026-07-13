import type { Variant, VariantHandlerResult, VariantInput, VariantObject } from "../types.ts";

// Escape regex meta characters so a user-supplied prefix is treated literally.
const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Build a {@link Variant} tuple from a declarative {@link VariantObject}. Exposed to
 * config authors as `createVariant(prefix, options)` (via `regexcss/helpers`), but plain
 * objects in `variants` go through this too — the object form needs no import.
 */
export const buildVariant = ({ prefix, selector, parent, group, note, sample }: VariantObject): Variant => {
  const selectorFn = typeof selector === "string" ? (s: string) => `${s}${selector}` : selector;
  // human-readable overview for docs output (`regexcss docs`); the group is carried
  // separately (shown as a chip), so it is not folded into this summary.
  const summary =
    [typeof selector === "string" ? `&${selector}` : selector ? "custom selector" : "", parent ?? ""]
      .filter(Boolean)
      .join(" · ") || undefined;
  // representative output for docs: the prefixed, `\:`-escaped selector (with any
  // selector transform applied) wrapped in the parent at-rule — `<utility>` stands
  // in for whatever class the variant is used on.
  const base = `.${prefix}\\:<utility>`;
  const declBlock = `${selectorFn ? selectorFn(base) : base} { … }`;
  const outputSample = parent ? `${parent} {\n  ${declBlock}\n}` : declBlock;
  return [
    new RegExp(`^${escapeRegExp(prefix)}:`),
    (_, raw) => ({
      matcher: raw.slice(prefix.length + 1),
      ...(selectorFn ? { selector: selectorFn } : {}),
      ...(parent ? { parent } : {}),
      ...(group !== undefined ? { group } : {}),
    }),
    { label: prefix, ...(group !== undefined ? { group } : {}), note: note ?? summary, sample: sample ?? outputSample },
  ];
};

/**
 * Normalize `UserConfig.variants` entries to {@link Variant} tuples. Tuples are arrays,
 * object definitions are not — everything downstream (matching, docs enumeration) only
 * ever sees tuples.
 */
export const normalizeVariants = (variants: VariantInput[]): Variant[] =>
  variants.map((v) => (Array.isArray(v) ? v : buildVariant(v)));

export interface VariantChainResult {
  matcher: string;
  chain: VariantHandlerResult[];
  /**
   * Definition index of each applied variant, in application order. Used as the primary
   * output sort key so variant groups are emitted in variant definition order (after the
   * unvarianted base utilities).
   */
  variantIndexes: number[];
  /**
   * Exclusivity groups that matched a second time and were skipped (e.g. `md:sm:` when
   * both share `group: "window-size"`). Non-empty means the chain was cut short on
   * purpose; the generator turns this into a {@link GenerateWarning}.
   */
  collidedGroups: string[];
}

export const applyVariantChain = (raw: string, variants: Variant[]): VariantChainResult => {
  let current = raw;
  const chain: VariantHandlerResult[] = [];
  const variantIndexes: number[] = [];
  const usedGroups = new Set<string>();
  const collidedGroups = new Set<string>();
  const seen = new Set<string>();

  while (true) {
    if (seen.has(current)) break;
    seen.add(current);

    let progressed = false;
    for (const [index, [re, handler]] of variants.entries()) {
      const m = current.match(re);
      if (!m) continue;
      const result = handler(m, current);
      if (!result) continue;
      if (result.group !== undefined) {
        // at most one variant per exclusivity group; a repeat is skipped so the
        // residue keeps its prefix and (normally) matches no rule
        if (usedGroups.has(result.group)) {
          collidedGroups.add(result.group);
          continue;
        }
        usedGroups.add(result.group);
      }
      chain.push(result);
      variantIndexes.push(index);
      current = result.matcher;
      progressed = true;
      break;
    }
    if (!progressed) break;
  }

  return { matcher: current, chain, variantIndexes, collidedGroups: [...collidedGroups] };
};
