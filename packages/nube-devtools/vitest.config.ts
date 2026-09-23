import * as path from "node:path";
import { defineConfig } from "vitest/config";

// Kept apart from vite.config.ts: the crx plugin builds the extension and has
// nothing to do in a test run.
export default defineConfig({
	esbuild: { jsx: "automatic" },
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	test: {
		environment: "happy-dom",
		include: ["src/**/*.spec.{ts,tsx}"],
		restoreMocks: true,
	},
});
