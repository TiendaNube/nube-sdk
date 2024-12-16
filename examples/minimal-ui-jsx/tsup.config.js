import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/main.tsx"],
  clean: true,
  format: ["esm"],
  dts: false,
  outDir: "./dist",
  minify: true,
  sourcemap: false,
  noExternal: [
    "@tiendanube/nube-sdk-ui",
  ],
  outExtension: ({ options }) => ({
    js: options.minify ? ".min.js" : ".js"
  })
});

