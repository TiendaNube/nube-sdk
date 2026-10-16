import * as path from "node:path";
import { defineConfig } from "vitest/config";

// Separate from `vite.config.ts`, whose crx plugin builds the whole extension.
export default defineConfig({
	test: {
		include: ["src/**/*.spec.ts"],
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
