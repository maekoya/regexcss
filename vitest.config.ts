export default {
  test: {
    include: ["tests/**/*.test.ts"],
    snapshotSerializers: ["./tests/serializers/css.ts"],
    coverage: {
      include: ["src/**/*.ts"],
      exclude: ["src/index.ts", "src/vite.ts", "src/types.ts"],
    },
  },
};
