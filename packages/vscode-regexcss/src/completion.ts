import * as vscode from "vscode";
import type { RegexcssState } from "./state.ts";
import { classAttributeContext } from "./tokens.ts";

/** Completion provider: offers concrete class names (with CSS preview) inside class attributes. */
export const createCompletionProvider = (
  stateFor: (uri: vscode.Uri) => Promise<RegexcssState | null>,
  getAttributes: (uri: vscode.Uri) => string[],
): vscode.CompletionItemProvider => ({
  async provideCompletionItems(document, position) {
    const before = document.lineAt(position.line).text.slice(0, position.character);
    const ctx = classAttributeContext(before, getAttributes(document.uri));
    if (!ctx) return undefined;
    const state = await stateFor(document.uri);
    if (!state) return undefined;
    // replace the class word being typed (which may contain `:` `-` `/` — VSCode's
    // default word range would stop at those, so set the range explicitly)
    const range = new vscode.Range(
      position.line,
      position.character - ctx.word.length,
      position.line,
      position.character,
    );
    return state.completions.map((c) => {
      const item = new vscode.CompletionItem(c.className, vscode.CompletionItemKind.Constant);
      item.detail = c.css;
      const md = new vscode.MarkdownString();
      md.appendCodeblock(`.${c.className} { ${c.css} }`, "css");
      item.documentation = md;
      item.range = range;
      return item;
    });
  },
});
