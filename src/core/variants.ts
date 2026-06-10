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
}

export const applyVariantChain = (raw: string, variants: Variant[]): VariantChainResult => {
  let current = raw;
  const chain: VariantHandlerResult[] = [];
  const variantIndexes: number[] = [];
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
      chain.push(result);
      variantIndexes.push(index);
      current = result.matcher;
      progressed = true;
      break;
    }
    if (!progressed) break;
  }

  return { matcher: current, chain, variantIndexes };
};
