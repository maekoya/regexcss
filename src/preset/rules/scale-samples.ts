import type { RuleSample } from "../../types.ts";

/**
 * Build docs samples for a rem-scale utility from its `class-prefix → CSS-property`
 * map. Each entry becomes `{ class: <className(key)>, style: "<prop>: <value>;" }` — the
 * value defaults to the `<num/4>rem` placeholder (1 unit = 0.25rem). Used by the spacing
 * / gap presets so the sample shape lives in one place.
 */
export const scaleSamples = (
  props: Record<string, string>,
  className: (key: string) => string,
  value = "<num/4>rem",
): RuleSample[] => Object.entries(props).map(([key, prop]) => ({ class: className(key), style: `${prop}: ${value};` }));
