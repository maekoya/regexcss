import type { Variant, VariantHandlerResult } from "../types.ts";

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
