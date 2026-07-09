import { describe, expect, it } from "vitest";
import type { DocRule, DocsData } from "../src/docs/enumerate.ts";
import { renderDocsHtml } from "../src/docs/render-html.ts";

const rule = (overrides: Partial<DocRule> = {}): DocRule => ({
  source: "^m-(\\d+)$",
  label: undefined,
  category: "spacing",
  tags: [],
  note: undefined,
  classes: [
    { className: "m-1", css: "margin: 0.25rem;" },
    { className: "m-2", css: "margin: 0.5rem;" },
  ],
  enumerable: true,
  ...overrides,
});

const data = (overrides: Partial<DocsData> = {}): DocsData => ({
  rules: [
    rule(),
    rule({
      source: "^flex$",
      category: undefined,
      classes: [{ className: "flex", css: "display: flex;" }],
    }),
  ],
  variants: [],
  warnings: [],
  ...overrides,
});

describe("renderDocsHtml", () => {
  it("lists every class with its generated CSS", () => {
    const html = renderDocsHtml(data());
    expect(html).toContain("<code>m-1</code>");
    expect(html).toContain("<code>margin: 0.25rem;</code>");
    expect(html).toContain("<code>flex</code>");
    expect(html).toContain("<code>display: flex;</code>");
    expect(html).toContain("3 classes · 2 rules");
  });

  it("groups rules under category headings, uncategorized under Rules", () => {
    const html = renderDocsHtml(data());
    expect(html).toContain(">spacing</h2>");
    expect(html).toContain(">Rules</h2>");
  });

  it("shows the label as the rule heading when present, with tag chips", () => {
    const html = renderDocsHtml(data({ rules: [rule({ label: "margin", tags: ["custom"] })] }));
    expect(html).toContain('<span class="label">margin</span>');
    expect(html).toContain('<span class="tag">custom</span>');
    // the regex still renders next to the label
    expect(html).toContain('<code class="re"');
  });

  it("hides the regex for labeled preset rules", () => {
    const html = renderDocsHtml(data({ rules: [rule({ label: "margin", tags: ["preset"] })] }));
    expect(html).toContain('<span class="label">margin</span>');
    expect(html).toContain('<span class="tag">preset</span>');
    expect(html).not.toContain('<code class="re"');
  });

  it("falls back to the regex source as the heading when there is no label", () => {
    const html = renderDocsHtml(data({ rules: [rule()] }));
    expect(html).not.toContain('<span class="label">');
    expect(html).not.toContain('<span class="tag">');
    expect(html).toContain('<code class="re"');
  });

  it("exposes label and tags to the filter via data-label", () => {
    const html = renderDocsHtml(data({ rules: [rule({ label: "Margin", tags: ["preset"] })] }));
    expect(html).toContain('data-label="margin preset"');
  });

  it("renders a rule's note under its heading", () => {
    const html = renderDocsHtml(data({ rules: [rule({ note: "negative values need a leading dash <1>" })] }));
    expect(html).toContain('<p class="note">negative values need a leading dash &lt;1&gt;</p>');
  });

  it("renders the note on a non-enumerable rule too", () => {
    const html = renderDocsHtml(
      data({
        rules: [rule({ source: "^bg-(\\w+)$", classes: [], enumerable: false, note: "colors come from your theme" })],
      }),
    );
    expect(html).toContain('<p class="note">colors come from your theme</p>');
    expect(html).toContain("not enumerable");
  });

  it("dedupes notes across rules merged under one label", () => {
    const html = renderDocsHtml(
      data({
        rules: [
          rule({ label: "margin", note: "1 unit = 0.25rem" }),
          rule({
            source: "^-m-(\\d+)$",
            label: "margin",
            note: "1 unit = 0.25rem",
            classes: [{ className: "-m-1", css: "margin: -0.25rem;" }],
          }),
        ],
      }),
    );
    expect(html.match(/<p class="note">1 unit = 0\.25rem<\/p>/g)).toHaveLength(1);
  });

  it("omits the note element when no rule has a note", () => {
    const html = renderDocsHtml(data());
    expect(html).not.toContain('class="note"');
  });

  it("renders every accordion open by default", () => {
    const many = Array.from({ length: 50 }, (_, i) => ({ className: `m-${i}`, css: "margin: 0;" }));
    const html = renderDocsHtml(data({ rules: [rule({ classes: many })] }));
    expect(html).toContain("<details open>");
    expect(html).not.toContain("<details>");
  });

  describe("variants", () => {
    it("renders a Variants section and nav group with label, regex, group, note, and sample", () => {
      const html = renderDocsHtml(
        data({
          variants: [
            {
              label: "md",
              source: "^md:",
              group: "window-size",
              note: "@media (--md)",
              sample: "@media (--md) {\n  .md\\:<utility> { … }\n}",
            },
          ],
        }),
      );
      expect(html).toContain(">Variants</h2>");
      expect(html).toContain(">Variants</h3>");
      expect(html).toContain('<span class="label">md</span>');
      expect(html).toContain('<span class="tag">group: window-size</span>');
      expect(html).toContain('<p class="note">@media (--md)</p>');
      expect(html).toContain(
        '<pre class="sample"><code>@media (--md) {\n  .md\\:&lt;utility&gt; { … }\n}</code></pre>',
      );
      // the group is searchable via data-label
      expect(html).toContain('data-label="md window-size');
      // no class table for variants
      expect(html).toContain('id="variants"');
    });

    it("counts variants in the summary and falls back to the regex when unlabeled", () => {
      const html = renderDocsHtml(
        data({
          variants: [
            {
              label: "hover",
              source: "^hover:",
              group: undefined,
              note: "&:hover",
              sample: ".hover\\:<utility>:hover { … }",
            },
            { label: "^dark:", source: "^dark:", group: undefined, note: undefined, sample: undefined },
          ],
        }),
      );
      expect(html).toContain("2 variants");
      expect(html).toContain('data-label="hover  &amp;:hover"');
    });

    it("omits the Variants section entirely when there are none", () => {
      const html = renderDocsHtml(data());
      expect(html).not.toContain(">Variants</h2>");
      expect(html).not.toContain("variants");
    });
  });

  it("merges rules sharing a label into one section with per-pattern tables", () => {
    const html = renderDocsHtml(
      data({
        rules: [
          rule({ label: "margin", tags: ["custom"] }),
          rule({
            source: "^-m-(\\d+)$",
            label: "margin",
            tags: ["custom"],
            classes: [{ className: "-m-1", css: "margin: -0.25rem;" }],
          }),
        ],
      }),
    );
    // one heading, one section, both patterns inside
    expect(html.match(/<span class="label">margin<\/span>/g)).toHaveLength(1);
    expect(html.match(/<section class="rule"/g)).toHaveLength(1);
    expect(html).toContain("2 patterns · 3 classes");
    expect(html.match(/<p class="pattern">/g)).toHaveLength(2);
    expect(html).toContain("<code>-m-1</code>");
    // tags dedupe across the merged rules
    expect(html.match(/<span class="tag">custom<\/span>/g)).toHaveLength(1);
  });

  it("merges all-preset groups into one table without regex pattern headings", () => {
    const html = renderDocsHtml(
      data({
        rules: [
          rule({ label: "margin", tags: ["preset"] }),
          rule({
            source: "^-m-(\\d+)$",
            label: "margin",
            tags: ["preset"],
            classes: [{ className: "-m-1", css: "margin: -0.25rem;" }],
          }),
        ],
      }),
    );
    expect(html.match(/<section class="rule"/g)).toHaveLength(1);
    expect(html.match(/<table>/g)).toHaveLength(1);
    expect(html).toContain("3 classes");
    expect(html).not.toContain("patterns ·");
    expect(html).not.toContain('<code class="re"');
    expect(html).toContain("<code>-m-1</code>");
  });

  it("renders user-defined categories above preset-only categories", () => {
    const html = renderDocsHtml(
      data({
        rules: [
          rule({ label: "margin", category: "spacing", tags: ["preset"] }),
          rule({ source: "^flex$", category: undefined, classes: [{ className: "flex", css: "display: flex;" }] }),
        ],
      }),
    );
    expect(html.indexOf(">Rules</h2>")).toBeLessThan(html.indexOf(">spacing</h2>"));
    // sidebar nav groups links by category in the same order
    expect(html.indexOf(">Rules</h3>")).toBeLessThan(html.indexOf(">spacing</h3>"));
  });

  it("does not merge rules with different labels or without labels", () => {
    const html = renderDocsHtml(
      data({
        rules: [
          rule({ label: "margin" }),
          rule({ source: "^p-(\\d+)$", label: "padding", classes: [{ className: "p-1", css: "padding: 0.25rem;" }] }),
          rule({ source: "^flex$", classes: [{ className: "flex", css: "display: flex;" }] }),
          rule({ source: "^grow$", classes: [{ className: "grow", css: "flex-grow: 1;" }] }),
        ],
      }),
    );
    expect(html.match(/<section class="rule"/g)).toHaveLength(4);
    expect(html).not.toContain("patterns ·");
  });

  it("shows the badge on a non-enumerable pattern inside a merged group", () => {
    const html = renderDocsHtml(
      data({
        rules: [
          rule({ label: "background-color" }),
          rule({ source: "^bg-(\\w+)$", label: "background-color", classes: [], enumerable: false }),
        ],
      }),
    );
    expect(html.match(/<section class="rule"/g)).toHaveLength(1);
    expect(html).toContain("not enumerable — add samples");
  });

  it("escapes HTML in regex sources, class names, and CSS", () => {
    const html = renderDocsHtml(
      data({
        rules: [
          rule({
            source: "^a<b&c$",
            label: '<lab"el>',
            category: undefined,
            classes: [{ className: 'x"<y', css: 'content: "<&>";' }],
          }),
        ],
      }),
    );
    expect(html).toContain("a&lt;b&amp;c");
    expect(html).toContain("&lt;lab&quot;el&gt;");
    expect(html).toContain("x&quot;&lt;y");
    expect(html).toContain("content: &quot;&lt;&amp;&gt;&quot;;");
    expect(html).not.toContain("a<b");
  });

  it("colorizes regex tokens in rule headings", () => {
    const html = renderDocsHtml(data());
    expect(html).toContain('<span class="re-esc">\\d</span>');
    expect(html).toContain('<span class="re-grp">(</span>');
    expect(html).toContain('<span class="re-meta">^</span>');
  });

  it("marks non-enumerable rules with a badge instead of a class table", () => {
    const html = renderDocsHtml(
      data({
        rules: [rule({ source: "^bg-(\\w+)$", category: "color", classes: [], enumerable: false })],
      }),
    );
    expect(html).toContain("not enumerable — add samples");
    expect(html).not.toContain("<table>");
  });

  it("renders warnings in the footer only when present", () => {
    expect(renderDocsHtml(data())).not.toContain("<footer>");
    const html = renderDocsHtml(data({ warnings: ["rule #0: something <odd>"] }));
    expect(html).toContain("<footer>");
    expect(html).toContain("something &lt;odd&gt;");
  });

  it("uses the title option", () => {
    const html = renderDocsHtml(data(), { title: "My <Utilities>" });
    expect(html).toContain("<title>My &lt;Utilities&gt;</title>");
    expect(html).toContain("<h1>My &lt;Utilities&gt;</h1>");
  });
});
