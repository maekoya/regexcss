import type { Variant, VariantHandlerResult } from "../types.ts";

export interface VariantChainResult {
  matcher: string;
  chain: VariantHandlerResult[];
}

export const applyVariantChain = (raw: string, variants: Variant[]): VariantChainResult => {
  let current = raw;
  const chain: VariantHandlerResult[] = [];
  const seen = new Set<string>();

  while (true) {
    if (seen.has(current)) break;
    seen.add(current);

    let progressed = false;
    for (const [re, handler] of variants) {
      const m = current.match(re);
      if (!m) continue;
      const result = handler(m, current);
      if (!result) continue;
      chain.push(result);
      current = result.matcher;
      progressed = true;
      break;
    }
    if (!progressed) break;
  }

  return { matcher: current, chain };
};
