// Inline assets for the docs page: the stylesheet and the client-side filter
// script. Kept apart from the render logic so the templating in render-html.ts
// stays readable. Both are emitted verbatim inside <style> / <script>.

export const STYLE = `
:root {
  color-scheme: light dark;
  --bg: #f8f8f5;
  --panel: #ffffff;
  --text: #22261f;
  --muted: #6c7268;
  --line: #e3e3da;
  --row: #f3f4ee;
  --accent: #0e7a5f;
  --accent-soft: #0e7a5f1a;
  --amber: #a15c07;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #12140f;
    --panel: #191c15;
    --text: #d8dbd2;
    --muted: #8b9086;
    --line: #2a2e26;
    --row: #1f231a;
    --accent: #4fc79f;
    --accent-soft: #4fc79f1f;
    --amber: #dfa259;
  }
}
* { box-sizing: border-box; }
body {
  margin: 0; display: grid; grid-template-columns: 16rem 1fr; align-items: start;
  background: var(--bg); color: var(--text);
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  font-size: 0.875rem; line-height: 1.55;
}
code { font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size: 0.9em; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

aside {
  position: sticky; top: 0; height: 100vh; overflow-y: auto;
  padding: 1.25rem 1rem; border-right: 1px solid var(--line);
}
aside h1 { margin: 0 0 0.125rem; font-size: 1rem; letter-spacing: 0.01em; }
aside .summary { margin: 0 0 0.875rem; color: var(--muted); font-size: 0.75rem; }
#filter {
  width: 100%; padding: 0.4rem 0.6rem; font: inherit;
  color: inherit; background: var(--panel);
  border: 1px solid var(--line); border-radius: 0.375rem;
}
#filter::placeholder { color: var(--muted); }
#filter:focus { border-color: var(--accent); outline: none; }
aside nav { margin-top: 0.5rem; }
aside h3 {
  margin: 1.25rem 0 0.25rem; font-size: 0.6875rem; font-weight: 600;
  letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted);
}
aside a {
  display: block; padding: 0.15rem 0.5rem; border-radius: 0.25rem;
  color: inherit; text-decoration: none;
  font-size: 0.8125rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
aside a code { font-size: 0.85em; color: var(--muted); }
aside a:hover { background: var(--accent-soft); color: var(--accent); }
aside a:hover code { color: var(--accent); }

main { min-width: 0; max-width: 60rem; padding: 1.5rem 2rem 6rem; }
main h2 {
  margin: 2.25rem 0 0.75rem; scroll-margin-top: 1rem;
  font-size: 0.75rem; font-weight: 600; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--muted);
}
main h2:first-of-type { margin-top: 0; }

section.rule {
  margin: 0 0 0.75rem; background: var(--panel);
  border: 1px solid var(--line); border-radius: 0.5rem;
  scroll-margin-top: 1rem;
  content-visibility: auto; contain-intrinsic-size: auto 3rem;
}
summary, section.rule > p {
  display: flex; align-items: baseline; gap: 0.625rem;
  margin: 0; padding: 0.625rem 1rem;
}
summary { cursor: pointer; list-style: none; }
section.rule > p { cursor: default; }
summary::-webkit-details-marker { display: none; }
summary::before { content: "▸"; flex: none; align-self: center; color: var(--muted); }
@media (prefers-reduced-motion: no-preference) {
  summary::before { transition: rotate 0.12s ease; }
}
details[open] > summary::before { rotate: 90deg; }

.label { flex: none; font-weight: 600; font-size: 0.9375rem; }
.re { flex: 0 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--muted); }
.re-grp { color: var(--accent); }
.re-esc { color: var(--amber); }
.re-meta { opacity: 0.7; }
.tag {
  flex: none; padding: 0 0.5rem; font-size: 0.6875rem;
  border-radius: 999px; background: var(--accent-soft); color: var(--accent);
}
.count { margin-left: auto; flex: none; color: var(--muted); font-size: 0.75rem; }
.badge {
  margin-left: auto; flex: none; padding: 0 0.5rem;
  font-size: 0.75rem; border: 1px solid var(--amber); border-radius: 999px; color: var(--amber);
}

.pattern {
  display: flex; align-items: baseline; gap: 0.625rem;
  margin: 0; padding: 0.375rem 1rem 0.125rem; color: var(--muted);
}

.note {
  margin: 0; padding: 0.125rem 1rem 0.5rem; color: var(--muted);
  font-size: 0.8125rem; font-style: italic;
}
section.rule > p + .note { padding-top: 0; }

.sample {
  margin: 0 1rem 0.75rem; padding: 0.5rem 0.75rem; overflow-x: auto;
  background: var(--row); border: 1px solid var(--line); border-radius: 0.375rem;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size: 0.75rem; line-height: 1.5;
}
.sample code { color: var(--text); }

table { width: 100%; border-collapse: collapse; }
td { padding: 0.3125rem 1rem; border-top: 1px solid var(--line); vertical-align: top; }
td:first-child { width: 1%; white-space: nowrap; }
td:first-child code { color: var(--accent); font-weight: 500; }
td:last-child code { color: var(--muted); }
tr:hover td { background: var(--row); }

footer { grid-column: 2; max-width: 60rem; padding: 0 2rem 4rem; color: var(--amber); }
footer h2 { color: var(--amber); font-size: 0.9375rem; }
footer ul { margin: 0.5rem 0; padding-left: 1.25rem; }
footer li { margin: 0.25rem 0; }

#no-results { margin: 3rem 0; color: var(--muted); }
[hidden] { display: none !important; }

@media (max-width: 48rem) {
  body { grid-template-columns: 1fr; }
  aside { position: static; height: auto; border-right: 0; border-bottom: 1px solid var(--line); }
  main { padding: 1.25rem 1.25rem 5rem; }
  footer { grid-column: 1; padding: 0 1.25rem 4rem; }
}
`.trim();

// filter (press "/" to focus): matches class names plus each rule's label / tags —
// a label hit keeps the whole rule visible. Hides emptied rules, their sidebar
// links, and any category heading (main or nav) left empty; shows the no-results
// notice when nothing survives.
export const SCRIPT = `
const filter = document.getElementById("filter");
const noResults = document.getElementById("no-results");
filter.addEventListener("input", () => {
  const q = filter.value.trim().toLowerCase();
  let anyVisible = false;
  for (const rule of document.querySelectorAll("section.rule")) {
    const labelHit = q !== "" && rule.dataset.label.includes(q);
    const rows = rule.querySelectorAll("tr[data-cls]");
    let visible = 0;
    for (const row of rows) {
      row.hidden = q !== "" && !labelHit && !row.dataset.cls.includes(q);
      if (!row.hidden) visible++;
    }
    rule.hidden = q !== "" && !labelHit && visible === 0;
    if (!rule.hidden) anyVisible = true;
    const details = rule.querySelector("details");
    if (details && q !== "" && !rule.hidden) details.open = true;
    const link = document.querySelector('aside a[href="#' + rule.id + '"]');
    if (link) link.hidden = rule.hidden;
  }
  for (const heading of document.querySelectorAll("main h2[data-category]")) {
    let el = heading.nextElementSibling;
    let any = false;
    while (el && el.tagName !== "H2") {
      if (!el.hidden) any = true;
      el = el.nextElementSibling;
    }
    heading.hidden = !any;
  }
  for (const heading of document.querySelectorAll("aside h3")) {
    let el = heading.nextElementSibling;
    let any = false;
    while (el && el.tagName === "A") {
      if (!el.hidden) any = true;
      el = el.nextElementSibling;
    }
    heading.hidden = !any;
  }
  noResults.hidden = q === "" || anyVisible;
});
document.addEventListener("keydown", (e) => {
  if (e.key === "/" && document.activeElement !== filter) {
    e.preventDefault();
    filter.focus();
  }
});
`.trim();
