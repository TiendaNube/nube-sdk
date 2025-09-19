import { vi } from "vitest";

Object.defineProperty(globalThis, "self", {
	value: {
		postMessage: vi.fn(),
		addEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	},
	writable: true,
	configurable: true,
});
