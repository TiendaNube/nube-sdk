import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/main.ts"],
  clean: true,
  format: ["esm"],
  dts: false,
  outDir: "./dist",
  minify: true,
  sourcemap: false,
  outExtension: ({ options }) => ({
    js: options.minify ? ".min.js" : ".js"
  })
});
