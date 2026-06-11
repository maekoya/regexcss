import { defaultExtractor } from "../extractor/tokenize.ts";
import type {
  GenerateOptions,
  GenerateResult,
  GenerateWarning,
  Generator,
  ResolvedConfig,
  UserConfig,
  VariantHandlerResult,
} from "../types.ts";
import { escapeSelector } from "./escape.ts";
import { renderLayer } from "./layer.ts";
import { matchRule } from "./rules.ts";
import { indentLines, stringifyDeclarations } from "./stringify.ts";
import { applyVariantChain } from "./variants.ts";

interface Block {
  raw: string;
  selector: string;
  parents: string[];
  decls: string;
  ruleIndex: number;
  variantIndexes: number[];
}

const resolveConfig = (user: UserConfig): ResolvedConfig => ({
  rules: user.rules,
  variants: user.variants ?? [],
  layerName: user.layerName,
  prefix: user.prefix ?? "",
  customMedia: user.customMedia ?? {},
  content: user.content ?? { include: [] },
  extractor: user.extractor ?? defaultExtractor,
});

const renderCustomMedia = (cm: Record<string, string>): string => {
  const entries = Object.entries(cm);
  if (entries.length === 0) return "";
  return entries.map(([name, query]) => `@custom-media ${name} ${query};`).join("\n");
};

const buildSelector = (raw: string, chain: VariantHandlerResult[]): string => {
  let sel = `.${escapeSelector(raw)}`;
  for (const v of chain) {
    if (v.selector) sel = v.selector(sel);
  }
  return sel;
};

const collectParents = (chain: VariantHandlerResult[]): string[] => {
  const parents: string[] = [];
  for (const v of chain) {
    if (v.parent) parents.push(v.parent);
  }
  return parents;
};

// Deterministic output order, independent of token discovery order. Sort keys:
// variant chain (definition indexes, lexicographic — base utilities first, then
// variant groups in variant definition order), then rule definition order, then
// the raw token. Output order is cascade order, so this makes "later rule /
// later variant wins" hold regardless of where tokens appear in the sources.
const compareBlocks = (a: Block, b: Block): number => {
  const va = a.variantIndexes;
  const vb = b.variantIndexes;
  const len = Math.min(va.length, vb.length);
  for (let i = 0; i < len; i++) {
    const d = (va[i] ?? 0) - (vb[i] ?? 0);
    if (d !== 0) return d;
  }
  if (va.length !== vb.length) return va.length - vb.length;
  if (a.ruleIndex !== b.ruleIndex) return a.ruleIndex - b.ruleIndex;
  return a.raw < b.raw ? -1 : a.raw > b.raw ? 1 : 0;
};

const groupBlocks = (blocks: Block[]): string => {
  const sorted = [...blocks].sort(compareBlocks);
  // NUL never occurs in an at-rule string, so it is a collision-safe join key.
  // The original parents array is kept alongside — the key is only for grouping.
  const grouped = new Map<string, { parents: string[]; blocks: Block[] }>();
  for (const b of sorted) {
    const key = b.parents.join("\0");
    let group = grouped.get(key);
    if (!group) {
      group = { parents: b.parents, blocks: [] };
      grouped.set(key, group);
    }
    group.blocks.push(b);
  }

  const parts: string[] = [];
  for (const { parents, blocks: bs } of grouped.values()) {
    const inner = bs.map((b) => `${b.selector} { ${b.decls} }`).join("\n");
    parts.push(wrapNested(parents, inner));
  }
  return parts.join("\n\n");
};

const wrapNested = (parents: string[], inner: string): string => {
  if (parents.length === 0) return inner;
  let acc = inner;
  for (let i = parents.length - 1; i >= 0; i--) {
    acc = `${parents[i]} {\n${indentLines(acc)}\n}`;
  }
  return acc;
};

interface CacheEntry {
  // `null` records "passed the prefix filter but matched no rule"
  block: Block | null;
  warning?: GenerateWarning;
}

const collisionWarning = (
  raw: string,
  collidedGroups: string[],
  residue: string,
  residueMatched: boolean,
): GenerateWarning => {
  const groups = collidedGroups.map((g) => JSON.stringify(g)).join(", ");
  return {
    token: raw,
    message: residueMatched
      ? `variant group ${groups} used more than once; the remainder "${residue}" even matched a rule, but the token was suppressed — check your variants/rules`
      : `variant group ${groups} used more than once; token ignored`,
  };
};

export const createGenerator = (userConfig: UserConfig): Generator => {
  const config = resolveConfig(userConfig);
  // Per-token memo. Config (rules/variants) is fixed for a generator's lifetime and
  // handlers are required to be pure, so a token always produces the same result.
  const cache = new Map<string, CacheEntry>();

  const generate = async (tokens: Iterable<string>, options?: GenerateOptions): Promise<GenerateResult> => {
    const seen = new Set<string>();
    const matched = new Set<string>();
    const unmatched = new Set<string>();
    const warnings: GenerateWarning[] = [];
    const blocks: Block[] = [];

    for (const raw of tokens) {
      if (seen.has(raw)) continue;
      seen.add(raw);

      let matcherInput = raw;
      if (config.prefix !== "") {
        if (!raw.startsWith(config.prefix)) continue;
        matcherInput = raw.slice(config.prefix.length);
      }

      const cached = cache.get(raw);
      if (cached !== undefined) {
        if (cached.block === null) {
          unmatched.add(raw);
        } else {
          blocks.push(cached.block);
          matched.add(raw);
        }
        if (cached.warning) warnings.push(cached.warning);
        continue;
      }

      const { matcher, chain, variantIndexes, collidedGroups } = applyVariantChain(matcherInput, config.variants);
      const ctx = {
        rawSelector: raw,
        currentSelector: matcher,
        variants: chain,
      };
      const match = matchRule(matcher, config.rules, ctx);
      const decls = match ? stringifyDeclarations(match.css) : "";
      // A group collision always suppresses the token: `md:sm:…` is a near-certain
      // typo, and half-applied CSS (only the first variant's wrapper) is worse than
      // none. matchRule still runs so the warning can say the residue would match.
      const collided = collidedGroups.length > 0;
      const produced = !collided && match !== undefined && decls.length > 0;
      const warning = collided ? collisionWarning(raw, collidedGroups, matcher, match !== undefined) : undefined;
      if (warning) warnings.push(warning);

      if (!produced) {
        cache.set(raw, { block: null, ...(warning ? { warning } : {}) });
        unmatched.add(raw);
        continue;
      }

      const block: Block = {
        raw,
        selector: buildSelector(raw, chain),
        parents: collectParents(chain),
        decls,
        ruleIndex: match?.index ?? 0,
        variantIndexes,
      };
      cache.set(raw, { block, ...(warning ? { warning } : {}) });
      blocks.push(block);
      matched.add(raw);
    }

    const body = groupBlocks(blocks);
    const effectiveLayerName = options?.layerName ?? config.layerName;
    const layered = renderLayer(body, effectiveLayerName);
    const cmDecl = renderCustomMedia(config.customMedia);
    const css = cmDecl ? (layered ? `${cmDecl}\n\n${layered}` : cmDecl) : layered;
    return { css, matched, unmatched, warnings };
  };

  return { generate, config };
};
