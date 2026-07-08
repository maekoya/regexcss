#!/usr/bin/env node
import { realpathSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { loadUserConfig } from "./config/load.ts";
import { enumerateClasses } from "./docs/enumerate.ts";
import { renderDocsHtml } from "./docs/render-html.ts";

const USAGE = `Usage: regexcss docs [options]

Generate an HTML page listing every class your regexcss config defines.

Options:
  -c, --config <path>   config file (default: auto-discover regexcss.config.{ts,mts,js,mjs,cjs})
  -o, --out <path>      output HTML file (default: regexcss-docs.html)
      --json            print the docs data as JSON to stdout instead of writing HTML
      --max-number <n>  upper bound when expanding \\d+ from rule regexes (default: 12)
      --max-classes <n> max classes documented per rule (default: 100, 0 = no cap)
      --title <text>    HTML page title (default: "regexcss classes")
  -h, --help            show this help
  -v, --version         print the version`;

export interface RunCliOptions {
  /** Directory to resolve the config and output path against (default: process.cwd()). */
  cwd?: string;
  stdout?: (line: string) => void;
  stderr?: (line: string) => void;
}

/** Run the CLI with the given arguments (excluding node and script). Returns the exit code. */
export const runCli = async (argv: string[], options: RunCliOptions = {}): Promise<number> => {
  const cwd = options.cwd ?? process.cwd();
  const stdout = options.stdout ?? ((line: string) => console.log(line));
  const stderr = options.stderr ?? ((line: string) => console.error(line));

  let values: {
    config?: string;
    out?: string;
    json?: boolean;
    "max-number"?: string;
    "max-classes"?: string;
    title?: string;
    help?: boolean;
    version?: boolean;
  };
  let positionals: string[];
  try {
    ({ values, positionals } = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        config: { type: "string", short: "c" },
        out: { type: "string", short: "o" },
        json: { type: "boolean" },
        "max-number": { type: "string" },
        "max-classes": { type: "string" },
        title: { type: "string" },
        help: { type: "boolean", short: "h" },
        version: { type: "boolean", short: "v" },
      },
    }));
  } catch (e) {
    stderr(e instanceof Error ? e.message : String(e));
    stderr(USAGE);
    return 1;
  }

  if (values.help) {
    stdout(USAGE);
    return 0;
  }
  if (values.version) {
    stdout(createRequire(import.meta.url)("../package.json").version as string);
    return 0;
  }
  if (positionals[0] !== "docs" || positionals.length !== 1) {
    stderr(USAGE);
    return 1;
  }

  // shared parse for the two non-negative-integer flags; returns undefined when unset,
  // NaN when invalid (caller reports and exits)
  const parseCount = (raw: string | undefined): number | undefined =>
    raw === undefined ? undefined : Number.isInteger(Number(raw)) && Number(raw) >= 0 ? Number(raw) : Number.NaN;

  const maxNumber = parseCount(values["max-number"]);
  if (Number.isNaN(maxNumber)) {
    stderr(`--max-number must be a non-negative integer, got "${values["max-number"]}"`);
    return 1;
  }
  const maxClassesPerRule = parseCount(values["max-classes"]);
  if (Number.isNaN(maxClassesPerRule)) {
    stderr(`--max-classes must be a non-negative integer (0 = no cap), got "${values["max-classes"]}"`);
    return 1;
  }

  const { config, sources } = await loadUserConfig(cwd, values.config);
  if (!config) {
    stderr(
      values.config
        ? `Config file not found: ${resolve(cwd, values.config)}`
        : `No regexcss.config.{ts,mts,js,mjs,cjs} found in ${cwd}`,
    );
    return 1;
  }

  const data = enumerateClasses(config, { maxNumber, maxClassesPerRule });
  for (const warning of data.warnings) stderr(`warning: ${warning}`);

  if (values.json) {
    stdout(JSON.stringify(data, null, 2));
    return 0;
  }

  const outPath = resolve(cwd, values.out ?? "regexcss-docs.html");
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, renderDocsHtml(data, { title: values.title }), "utf8");
  const totalClasses = data.rules.reduce((n, r) => n + r.classes.length, 0);
  const suffix = data.warnings.length > 0 ? `, ${data.warnings.length} warnings` : "";
  stdout(`${totalClasses} classes from ${data.rules.length} rules (${sources[0]})${suffix} → ${outPath}`);
  return 0;
};

// run only when executed directly (realpath: the npm bin entry is a symlink)
const entry = process.argv[1];
if (entry && import.meta.url === pathToFileURL(realpathSync(entry)).href) {
  void runCli(process.argv.slice(2)).then((code) => {
    process.exitCode = code;
  });
}
