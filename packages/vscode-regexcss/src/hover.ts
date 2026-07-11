import * as vscode from "vscode";
import { formatExplainCss } from "./format.ts";
import type { RegexcssState } from "./state.ts";
import { tokenAt } from "./tokens.ts";

/** Hover provider: shows the CSS the class under the cursor produces. */
export const createHoverProvider = (
  stateFor: (uri: vscode.Uri) => Promise<RegexcssState | null>,
): vscode.HoverProvider => ({
  async provideHover(document, position) {
    const state = await stateFor(document.uri);
    if (!state) return undefined;

    const line = document.lineAt(position.line).text;
    const tok = tokenAt(line, position.character);
    if (!tok) return undefined;

    const res = state.generator.explain(tok.text);
    if (!res) return undefined;

    const md = new vscode.MarkdownString();
    md.appendCodeblock(formatExplainCss(res), "css");

    const range = new vscode.Range(position.line, tok.start, position.line, tok.end);
    return new vscode.Hover(md, range);
  },
});
