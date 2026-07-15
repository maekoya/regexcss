import type { Rule } from "../../../types.ts";
import { withMeta } from "../../shared/with-meta.ts";

// line-clamp — https://tailwindcss.com/docs/line-clamp

export interface LineClampOptions {
  /** Largest line count accepted, inclusive (default 6). Out-of-range values match no rule. */
  max?: number;
}

export const createLineClampRules = ({ max = 6 }: LineClampOptions = {}): Rule[] =>
  withMeta(
    [
      [
        /^line-clamp-(\d+)$/,
        ([, n]) =>
          n && Number(n) <= max
            ? {
                overflow: "hidden",
                display: "-webkit-box",
                "-webkit-box-orient": "vertical",
                "-webkit-line-clamp": n,
              }
            : undefined,
        {
          samples: [
            {
              class: "line-clamp-<num>",
              style: "overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: <num>;",
            },
          ],
        },
      ],
      [
        /^line-clamp-none$/,
        () => ({
          overflow: "visible",
          display: "block",
          "-webkit-box-orient": "horizontal",
          "-webkit-line-clamp": "none",
        }),
      ],
    ],
    { label: "line-clamp", category: "typography", tags: ["preset"] },
  );