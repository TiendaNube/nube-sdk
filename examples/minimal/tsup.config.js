import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["./src/main.ts"],
	clean: true,
	format: ["iife"],
	dts: false,
	outDir: "./dist",
	minify: false,
	sourcemap: false,
});
