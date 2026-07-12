import { describe, expect, it } from "vitest";
import { formatExplainCss } from "../src/format.ts";

describe("formatExplainCss", () => {
  it("renders a plain rule with one declaration per line", () => {
    expect(formatExplainCss({ selector: ".m-4", declarations: "margin: 1rem;", parents: [] })).toBe(
      ".m-4 {\n  margin: 1rem; /* 16px */\n}",
    );
  });

  it("annotates rem values with their px equivalent", () => {
    expect(formatExplainCss({ selector: ".p-8", declarations: "padding: 2rem;", parents: [] })).toBe(
      ".p-8 {\n  padding: 2rem; /* 32px */\n}",
    );
  });

  it("converts every rem in a multi-value declaration", () => {
    expect(formatExplainCss({ selector: ".mx", declarations: "margin: 0.5rem 1rem;", parents: [] })).toBe(
      ".mx {\n  margin: 0.5rem 1rem; /* 8px 16px */\n}",
    );
  });

  it("converts rem inside calc() and keeps other units", () => {
    expect(formatExplainCss({ selector: ".w", declarations: "width: calc(1rem + 2px);", parents: [] })).toBe(
      ".w {\n  width: calc(1rem + 2px); /* calc(16px + 2px) */\n}",
    );
  });

  it("leaves rem-free declarations untouched", () => {
    expect(formatExplainCss({ selector: ".block", declarations: "display: block;", parents: [] })).toBe(
      ".block {\n  display: block;\n}",
    );
  });

  it("splits multiple declarations", () => {
    expect(
      formatExplainCss({
        selector: ".truncate",
        declarations: "overflow: hidden; text-overflow: ellipsis;",
        parents: [],
      }),
    ).toBe(".truncate {\n  overflow: hidden;\n  text-overflow: ellipsis;\n}");
  });

  it("wraps the rule in variant at-rule parents", () => {
    expect(formatExplainCss({ selector: ".md\\:m-4", declarations: "margin: 1rem;", parents: ["@media (--md)"] })).toBe(
      "@media (--md) {\n  .md\\:m-4 {\n    margin: 1rem; /* 16px */\n  }\n}",
    );
  });
});
