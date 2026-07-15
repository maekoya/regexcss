import type { Rule } from "../../../types.ts";
import { withMeta } from "../../shared/with-meta.ts";
import { makeSizingRules } from "./_shared.ts";

// max-width — https://tailwindcss.com/docs/max-width

export interface MaxWidthOptions {
  /** Largest value the numeric scale accepts, inclusive (default 96). */
  max?: number;
  /** CSS variable prefix for the container-scale tokens (`max-w-3xs` → `var(--<baseContainerTokenPrefix>-3xs)`, default "container"). */
  baseContainerTokenPrefix?: string;
  /** Drop the container-scale token rules entirely (`max-w-3xs` ... `max-w-7xl` stop matching). Wins over `baseContainerTokenPrefix`. Default false. */
  excludeContainerClasses?: boolean;
}

export const createMaxWidthRules = ({
  max,
  baseContainerTokenPrefix,
  excludeContainerClasses,
}: MaxWidthOptions = {}): Rule[] =>
  withMeta(
    makeSizingRules(
      "max-w",
      "max",
      {
        screen: "100vw",
        axis: "w",
        container: excludeContainerClasses ? undefined : (baseContainerTokenPrefix ?? "container"),
        max,
      },
      (v) => ({ "max-width": v }),
    ),
    { label: "max-width", category: "sizing", tags: ["preset", "tailwind"] },
  );
