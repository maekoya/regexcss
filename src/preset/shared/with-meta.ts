import type { Rule, RuleMeta } from "../../types.ts";

/**
 * Attach default docs metadata to every rule. Fields already set on a rule's own
 * meta win; `tags` are merged as a union. Each preset rule file wraps its rules with
 * this so they stay self-describing (label / category / `"preset"` tag) when imported
 * and used on their own — the category aggregates just concatenate the results.
 */
export const withMeta = (rules: Rule[], defaults: RuleMeta): Rule[] =>
  rules.map(([re, handler, meta]) => {
    const merged: RuleMeta = { ...defaults, ...meta };
    const tags = [...new Set([...(defaults.tags ?? []), ...(meta?.tags ?? [])])];
    if (tags.length > 0) merged.tags = tags;
    return [re, handler, merged];
  });
