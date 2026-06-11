import { resolve } from "node:path";
import { loadConfig } from "unconfig";
import type { UserConfig } from "../types.ts";

export interface LoadedConfig {
  config: UserConfig | undefined;
  sources: string[];
}

/**
 * Load the regexcss config. With `configFile` the exact path (resolved against `cwd`)
 * is loaded — extension included, no name guessing. Without it, `regexcss.config.*`
 * is auto-discovered from `cwd`.
 */
export const loadUserConfig = async (cwd: string, configFile?: string): Promise<LoadedConfig> => {
  const result = await loadConfig<UserConfig>({
    sources: configFile
      ? [
          {
            // an empty extensions list makes unconfig use the path verbatim
            files: resolve(cwd, configFile),
            extensions: [],
          },
        ]
      : [
          {
            files: "regexcss.config",
            extensions: ["ts", "mts", "js", "mjs", "cjs"],
          },
        ],
    cwd,
    merge: false,
  });
  return {
    config: result.config,
    sources: result.sources,
  };
};
