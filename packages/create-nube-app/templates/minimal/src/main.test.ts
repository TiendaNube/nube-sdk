import { describe, it, expect, vi } from "vitest";
import { App } from "./main";
import type { NubeSDK } from "@tiendanube/nube-sdk-types";

describe("App", () => {
	it("should register cart:update event handler", () => {
		// Mock NubeSDK
		const mockNube: Partial<NubeSDK> = {
			on: vi.fn(),
		};

		// Execute App function with mock
		App(mockNube as NubeSDK);

		// Verify if cart:update event was registered
		expect(mockNube.on).toHaveBeenCalledWith(
			"cart:update",
			expect.any(Function),
		);
	});

	it("should log cart data when cart:update event is triggered", () => {
		// Mock console.log
		const consoleSpy = vi.spyOn(console, "log");

		// Mock NubeSDK
		const mockNube: Partial<NubeSDK> = {
			on: vi.fn((event, handler) => {
				if (event === "cart:update") {
					// Simulate event being triggered
					handler({ cart: { id: "123", total: 100 } });
				}
			}),
		};

		// Execute App function with mock
		App(mockNube as NubeSDK);

		// Verify if console.log was called with cart data
		expect(consoleSpy).toHaveBeenCalledWith({ id: "123", total: 100 });
	});
});
