export default {
  test: {
    include: ["src/**/*.test.ts", "tests/**/*.test.ts", "packages/*/tests/**/*.test.ts"],
    snapshotSerializers: ["./tests/serializers/css.ts"],
    coverage: {
      include: ["src/**/*.ts"],
      exclude: ["src/index.ts", "src/vite.ts", "src/types.ts", "src/**/*.test.ts", "src/preset/test-helpers.ts"],
    },
  },
};
