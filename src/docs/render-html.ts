import { SCRIPT, STYLE } from "./assets.ts";
import type { DocRule, DocsData, DocVariant } from "./enumerate.ts";

export interface RenderDocsHtmlOptions {
  /** Page title (default "regexcss classes"). */
  title?: string;
}

const escapeHtml = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Escape + colorize a regex source: groups/alternation, escapes (`\d`, `\.`),
 * and bare metacharacters each get their own token class so the pattern reads
 * as syntax, not as noise.
 */
const highlightRegex = (source: string): string => {
  let out = "";
  let literal = "";
  const flush = () => {
    if (literal) {
      out += escapeHtml(literal);
      literal = "";
    }
  };
  for (let i = 0; i < source.length; i++) {
    const c = source[i] ?? "";
    if (c === "\\" && i + 1 < source.length) {
      flush();
      out += `<span class="re-esc">${escapeHtml(c + (source[i + 1] ?? ""))}</span>`;
      i++;
    } else if (c === "(" || c === ")" || c === "|") {
      flush();
      out += `<span class="re-grp">${escapeHtml(c)}</span>`;
    } else if ("[]^$?+*{}.".includes(c)) {
      flush();
      out += `<span class="re-meta">${escapeHtml(c)}</span>`;
    } else {
      literal += c;
    }
  }
  flush();
  return out;
};

const slug = (category: string): string => `cat-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

// preset rules hide their regex in docs output and sort below user-defined rules
const isPreset = (rule: DocRule): boolean => rule.tags.includes("preset");

// heading for a single (unmerged) rule: label (or the regex when unlabeled), the
// regex itself (omitted for labeled preset rules), then tag chips
const renderHeading = (rule: DocRule): string => {
  const regex = `<code class="re" title="/${escapeHtml(rule.source)}/">/${highlightRegex(rule.source)}/</code>`;
  const tags = rule.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("");
  if (!rule.label) return `${regex}${tags}`;
  const detail = isPreset(rule) ? "" : regex;
  return `<span class="label">${escapeHtml(rule.label)}</span>${detail}${tags}`;
};

const renderRows = (rule: DocRule): string =>
  rule.classes
    .map(
      (c) =>
        `<tr data-cls="${escapeHtml(c.className.toLowerCase())}"><td><code>${escapeHtml(c.className)}</code></td><td><code>${escapeHtml(c.css)}</code></td></tr>`,
    )
    .join("\n");

// one constituent rule inside a merged same-label group: its regex, then its classes
const renderPattern = (rule: DocRule): string => {
  const regex = `<p class="pattern"><code class="re" title="/${escapeHtml(rule.source)}/">/${highlightRegex(rule.source)}/</code>`;
  if (!rule.enumerable) return `${regex}<span class="badge">not enumerable — add samples</span></p>`;
  if (rule.classes.length === 0) return `${regex}</p>`;
  return `${regex}</p>\n<table><tbody>\n${renderRows(rule)}\n</tbody></table>`;
};

interface RuleGroup {
  label: string | undefined;
  rules: DocRule[];
}

// merge rules sharing a label into one group; unlabeled rules stay standalone
const groupByLabel = (rules: DocRule[]): RuleGroup[] => {
  const groups: RuleGroup[] = [];
  const byLabel = new Map<string, RuleGroup>();
  for (const rule of rules) {
    const existing = rule.label === undefined ? undefined : byLabel.get(rule.label);
    if (existing) {
      existing.rules.push(rule);
      continue;
    }
    const group: RuleGroup = { label: rule.label, rules: [rule] };
    if (rule.label !== undefined) byLabel.set(rule.label, group);
    groups.push(group);
  }
  return groups;
};

// notes from a group's rules, deduped, each as its own line under the heading
const renderNotes = (rules: DocRule[]): string => {
  const notes = [...new Set(rules.map((r) => r.note).filter((n): n is string => n !== undefined && n !== ""))];
  return notes.map((n) => `<p class="note">${escapeHtml(n)}</p>`).join("\n");
};

interface RenderedGroup {
  /** The `<section>` for the main column. */
  section: string;
  /** The `<a>` link for the sidebar nav. */
  navLink: string;
}

// Build both the main-column section and its sidebar link for one group. `id`
// anchors the link to the section (and lets the filter hide the two together).
const renderGroup = (group: RuleGroup, id: string): RenderedGroup => {
  const single = group.rules.length === 1 ? group.rules[0] : undefined;
  const tags = [...new Set(group.rules.flatMap((r) => r.tags))];
  const headingText = group.label ?? group.rules[0]?.source ?? "";
  const dataLabel = escapeHtml([headingText, ...tags].join(" ").toLowerCase());

  // sidebar link: label text, or the raw regex for unlabeled rules
  const navText = group.label === undefined ? `<code>/${escapeHtml(headingText)}/</code>` : escapeHtml(group.label);
  const navLink = `<a href="#${id}" data-label="${dataLabel}">${navText}</a>`;

  // section heading: single rules reuse renderHeading (regex-fallback + preset hide);
  // merged groups always have a label, so show it plus the merged tag union
  const tagsHtml = tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("");
  const heading = single
    ? renderHeading(single)
    : `<span class="label">${escapeHtml(group.label ?? "")}</span>${tagsHtml}`;

  const notes = renderNotes(group.rules);

  // non-enumerable single rule: badge, no table
  if (single && !single.enumerable) {
    const section = [
      `<section class="rule" id="${id}" data-label="${dataLabel}">`,
      `<p>${heading}<span class="badge">not enumerable — add samples</span></p>`,
      notes,
      `</section>`,
    ]
      .filter((s) => s !== "")
      .join("\n");
    return { section, navLink };
  }

  const total = group.rules.reduce((n, r) => n + r.classes.length, 0);
  const classCount = `${total} ${total === 1 ? "class" : "classes"}`;

  let count: string;
  let body: string;
  if (single) {
    count = classCount;
    body = `<table><tbody>\n${renderRows(single)}\n</tbody></table>`;
  } else {
    // all-preset groups hide their regexes, so pattern boundaries carry no
    // information — render one combined table instead of per-pattern tables
    const allPreset = group.rules.every(isPreset);
    count = allPreset ? classCount : `${group.rules.length} patterns · ${classCount}`;
    body = allPreset
      ? `<table><tbody>\n${group.rules.map(renderRows).filter(Boolean).join("\n")}\n</tbody></table>`
      : group.rules.map(renderPattern).join("\n");
  }

  const section = [
    `<section class="rule" id="${id}" data-label="${dataLabel}"><details open>`,
    `<summary>${heading}<span class="count">${count}</span></summary>`,
    notes,
    body,
    `</details></section>`,
  ]
    .filter((s) => s !== "")
    .join("\n");
  return { section, navLink };
};

// Variants are documented by an overview only (no class combinations): the prefix,
// the regex, and a note describing the selector / at-rule it applies.
const renderVariant = (variant: DocVariant, id: string): RenderedGroup => {
  const dataLabel = escapeHtml([variant.label, variant.group ?? "", variant.note ?? ""].join(" ").toLowerCase());
  const regex = `<code class="re" title="/${escapeHtml(variant.source)}/">/${highlightRegex(variant.source)}/</code>`;
  const group = variant.group ? `<span class="tag">group: ${escapeHtml(variant.group)}</span>` : "";
  const navLink = `<a href="#${id}" data-label="${dataLabel}">${escapeHtml(variant.label)}</a>`;
  const note = variant.note ? `\n<p class="note">${escapeHtml(variant.note)}</p>` : "";
  const sample = variant.sample ? `\n<pre class="sample"><code>${escapeHtml(variant.sample)}</code></pre>` : "";
  const section = `<section class="rule" id="${id}" data-label="${dataLabel}"><p><span class="label">${escapeHtml(variant.label)}</span>${regex}${group}</p>${note}${sample}</section>`;
  return { section, navLink };
};

/**
 * Render a self-contained, two-pane HTML page listing every enumerated class with
 * its CSS. A sticky sidebar carries the title, filter, and a per-rule nav; the main
 * column groups rules by {@link RuleMeta.category} (uncategorized rules under
 * "Rules"), user-defined categories first. Enumeration warnings render in a footer.
 */
export const renderDocsHtml = (data: DocsData, options: RenderDocsHtmlOptions = {}): string => {
  const title = options.title ?? "regexcss classes";

  const groups = new Map<string, DocRule[]>();
  for (const rule of data.rules) {
    const key = rule.category ?? "Rules";
    const group = groups.get(key);
    if (group) group.push(rule);
    else groups.set(key, [rule]);
  }

  // user-defined rules first: categories made up entirely of preset rules sink
  // to the bottom, both partitions keeping first-appearance order
  const entries = [...groups.entries()];
  const ordered = [
    ...entries.filter(([, rules]) => !rules.every(isPreset)),
    ...entries.filter(([, rules]) => rules.every(isPreset)),
  ];

  const navParts: string[] = [];
  const sectionParts: string[] = [];
  for (const [category, rules] of ordered) {
    const catId = slug(category);
    const rendered = groupByLabel(rules).map((group, i) => renderGroup(group, `${catId}-${i}`));
    navParts.push(`<h3>${escapeHtml(category)}</h3>\n${rendered.map((r) => r.navLink).join("\n")}`);
    sectionParts.push(
      `<h2 id="${catId}" data-category="${escapeHtml(category)}">${escapeHtml(category)}</h2>\n${rendered.map((r) => r.section).join("\n")}`,
    );
  }

  // variants: an overview section at the end, no class combinations
  if (data.variants.length > 0) {
    const rendered = data.variants.map((v, i) => renderVariant(v, `variant-${i}`));
    navParts.push(`<h3>Variants</h3>\n${rendered.map((r) => r.navLink).join("\n")}`);
    sectionParts.push(
      `<h2 id="variants" data-category="Variants">Variants</h2>\n${rendered.map((r) => r.section).join("\n")}`,
    );
  }

  const totalClasses = data.rules.reduce((n, r) => n + r.classes.length, 0);
  const variantCount = data.variants.length > 0 ? ` · ${data.variants.length} variants` : "";
  const summary = `${totalClasses} classes · ${data.rules.length} rules${variantCount}`;

  const footer =
    data.warnings.length === 0
      ? ""
      : `<footer><h2>Warnings</h2><ul>\n${data.warnings.map((w) => `<li>${escapeHtml(w)}</li>`).join("\n")}\n</ul></footer>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
${STYLE}
</style>
</head>
<body>
<aside>
<h1>${escapeHtml(title)}</h1>
<p class="summary">${summary}</p>
<input id="filter" type="search" placeholder="filter classes — press /" autocomplete="off">
<nav>
${navParts.join("\n")}
</nav>
</aside>
<main>
${sectionParts.join("\n")}
<p id="no-results" hidden>no classes match the filter</p>
</main>
${footer}
<script>
${SCRIPT}
</script>
</body>
</html>
`;
};
