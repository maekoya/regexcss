import type { Rule } from "../../../types.ts";
import { withMeta } from "../../shared/with-meta.ts";
import { makeSizingRules } from "./_shared.ts";

// width — https://tailwindcss.com/docs/width

export interface WidthOptions {
  /** Largest value the numeric scale accepts, inclusive (default 96). */
  max?: number;
  /** CSS variable prefix for the container-scale tokens (`w-3xs` → `var(--<baseContainerTokenPrefix>-3xs)`, default "container"). */
  baseContainerTokenPrefix?: string;
  /** Drop the container-scale token rules entirely (`w-3xs` ... `w-7xl` stop matching). Wins over `baseContainerTokenPrefix`. Default false. */
  excludeContainerClasses?: boolean;
}

export const createWidthRules = ({
  max,
  baseContainerTokenPrefix,
  excludeContainerClasses,
}: WidthOptions = {}): Rule[] =>
  withMeta(
    makeSizingRules(
      "w",
      "base",
      {
        screen: "100vw",
        axis: "w",
        container: excludeContainerClasses ? undefined : (baseContainerTokenPrefix ?? "container"),
        max,
      },
      (v) => ({ width: v }),
    ),
    { label: "width", category: "sizing", tags: ["preset", "tailwind"] },
  );
