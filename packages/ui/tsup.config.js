import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/index.ts", "./src/predicates.ts"],
  clean: true,
  format: ["esm", "cjs"],
  dts: true,
  outDir: "./dist",
  minify: false,
  sourcemap: true,
});
