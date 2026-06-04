import type { SnapshotSerializer } from "vitest";

const normalize = (s: string): string =>
  s
    .split("\n")
    .map((l) => l.trimEnd())
    .filter((l, i, arr) => !(l === "" && arr[i - 1] === ""))
    .join("\n")
    .trim();

const serializer: SnapshotSerializer = {
  test: (val): val is string => typeof val === "string" && val.includes("{"),
  serialize: (val) => normalize(val as string),
};

export default serializer;
