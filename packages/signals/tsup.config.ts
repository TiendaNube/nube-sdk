import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["./src/signal.ts"],
	clean: true,
	format: ["esm", "cjs"],
	dts: true,
	outDir: "./dist",
	minify: false,
	sourcemap: true,
});
