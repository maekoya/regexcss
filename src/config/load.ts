import { loadConfig } from "unconfig";
import type { UserConfig } from "../types.ts";

export interface LoadedConfig {
  config: UserConfig | undefined;
  sources: string[];
}

export const loadUserConfig = async (cwd: string): Promise<LoadedConfig> => {
  const result = await loadConfig<UserConfig>({
    sources: [
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
