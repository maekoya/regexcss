import { createGenerator, type Rule } from "regexcss";
import { describe, expect, it } from "vite-plus/test";
import { buildCompletions } from "../src/state.ts";

const rules: Rule[] = [
  [/^w-(\d+)\/(\d+)$/, ([, a, b]) => ({ width: `${(Number(a) / Number(b)) * 100}%` })],
  [/^m-([.\d]+)$/, ([, n]) => ({ margin: `${Number(n) / 4}rem` })],
];

describe("buildCompletions", () => {
  it("previews each class with the escaped selector the generator emits", () => {
    const generator = createGenerator({ rules });
    const [entry] = buildCompletions(generator, [{ kind: "class", className: "w-1/2", css: "width: 50%;" }]);
    expect(entry?.preview).toBe(".w-1\\/2 {\n  width: 50%;\n}");
  });

  it("formats the preview like the hover (rem annotated with px)", () => {
    const generator = createGenerator({ rules });
    const [entry] = buildCompletions(generator, [{ kind: "class", className: "m-4", css: "margin: 1rem;" }]);
    expect(entry?.preview).toBe(".m-4 {\n  margin: 1rem; /* 16px */\n}");
  });

  it("drops noisy decimals and duplicate class names", () => {
    const generator = createGenerator({ rules });
    const names = buildCompletions(generator, [
      { kind: "class", className: "m-0.5", css: "margin: 0.125rem;" },
      { kind: "class", className: "m-0.3", css: "margin: 0.075rem;" },
      { kind: "class", className: "m-1", css: "margin: 0.25rem;" },
      { kind: "class", className: "m-1", css: "margin: 0.25rem;" },
    ]).map((c) => c.className);
    expect(names).toEqual(["m-0.5", "m-1"]);
  });
});
