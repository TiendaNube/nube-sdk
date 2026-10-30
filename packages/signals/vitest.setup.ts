// Vitest setup file for signals package
Object.defineProperty(globalThis, "self", {
	value: {
		__APP_DATA__: {
			id: "test-app-id",
			script: "test-script",
		},
	},
	writable: true,
	configurable: true,
});
