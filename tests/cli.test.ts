import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { runCli } from "../src/cli.ts";

const CONFIG_TS = `
export default {
  rules: [
    [/^m-(\\d+)$/, ([, n]) => ({ margin: \`\${n}px\` })],
    [/^flex$/, () => ({ display: "flex" })],
  ],
};
`;

describe("runCli", () => {
  let dir: string;
  let out: string[];
  let err: string[];

  const cli = (argv: string[]) => runCli(argv, { cwd: dir, stdout: (l) => out.push(l), stderr: (l) => err.push(l) });

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "regexcss-cli-"));
    out = [];
    err = [];
  });
  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("writes the docs HTML next to the auto-discovered config", async () => {
    await writeFile(join(dir, "regexcss.config.ts"), CONFIG_TS, "utf8");
    const code = await cli(["docs"]);
    expect(code).toBe(0);
    const html = await readFile(join(dir, "regexcss-docs.html"), "utf8");
    expect(html).toContain("<code>m-1</code>");
    expect(html).toContain("<code>flex</code>");
    expect(out[0]).toContain("regexcss-docs.html");
  });

  it("respects --out and --config, creating parent directories", async () => {
    await writeFile(join(dir, "custom.config.ts"), CONFIG_TS, "utf8");
    const code = await cli(["docs", "-c", "custom.config.ts", "-o", "docs/classes.html"]);
    expect(code).toBe(0);
    const html = await readFile(join(dir, "docs", "classes.html"), "utf8");
    expect(html).toContain("<code>m-1</code>");
  });

  it("prints DocsData JSON to stdout with --json", async () => {
    await writeFile(join(dir, "regexcss.config.ts"), CONFIG_TS, "utf8");
    const code = await cli(["docs", "--json", "--max-number", "2"]);
    expect(code).toBe(0);
    const data = JSON.parse(out.join("\n"));
    expect(data.rules).toHaveLength(2);
    expect(data.rules[0].classes.map((c: { className: string }) => c.className)).toEqual(["m-0", "m-1", "m-2"]);
    expect(data.warnings).toEqual([]);
  });

  it("exits 1 with a clear message when no config exists", async () => {
    const code = await cli(["docs"]);
    expect(code).toBe(1);
    expect(err[0]).toContain("No regexcss.config");
  });

  it("exits 1 when the explicit config path is missing", async () => {
    const code = await cli(["docs", "-c", "missing.ts"]);
    expect(code).toBe(1);
    expect(err[0]).toContain("missing.ts");
  });

  it("exits 1 on an unknown subcommand or unknown flag", async () => {
    expect(await cli(["nope"])).toBe(1);
    expect(await cli(["docs", "--bogus"])).toBe(1);
  });

  it("validates --max-number", async () => {
    await writeFile(join(dir, "regexcss.config.ts"), CONFIG_TS, "utf8");
    const code = await cli(["docs", "--max-number", "abc"]);
    expect(code).toBe(1);
    expect(err[0]).toContain("--max-number");
  });

  it("validates --max-classes and forwards it (0 = no cap)", async () => {
    await writeFile(
      join(dir, "regexcss.config.ts"),
      `export default { rules: [[/^x-(\\d+)-(\\d+)$/, ([, a, b]) => ({ order: \`\${a}\${b}\` })]] };`,
      "utf8",
    );
    expect(await cli(["docs", "--max-classes", "-3"])).toBe(1);
    expect(err[0]).toContain("--max-classes");

    out = [];
    err = [];
    expect(await cli(["docs", "--json", "--max-classes", "0"])).toBe(0);
    const data = JSON.parse(out.join("\n"));
    expect(data.rules[0].classes.length).toBe(169); // uncapped
    expect(data.warnings).toEqual([]);
  });

  it("prints usage for --help and the version for --version", async () => {
    expect(await cli(["--help"])).toBe(0);
    expect(out[0]).toContain("Usage: regexcss docs");
    out = [];
    expect(await cli(["--version"])).toBe(0);
    expect(out[0]).toMatch(/^\d+\.\d+\.\d+/);
  });

  it("forwards enumeration warnings to stderr", async () => {
    await writeFile(
      join(dir, "regexcss.config.ts"),
      `export default { rules: [[/^bg-(\\w+)$/, ([, c]) => ({ background: c })]] };`,
      "utf8",
    );
    const code = await cli(["docs"]);
    expect(code).toBe(0);
    expect(err[0]).toContain("could not be enumerated");
  });
});
