import type { NubeSDK, NubeSDKState } from "@tiendanube/nube-sdk-types";
import { describe, expect, it, vi } from "vitest";
import { App } from "./main";

// Mock do componente MyCustomField
vi.mock("./components/MyCustomField", () => ({
	MyCustomField: vi.fn(() => ({
		type: "box",
		width: 100,
		height: 100,
	})),
}));

describe("App", () => {
	it("should set MyCustomField component in after_line_items slot", () => {
		// Mock NubeSDK
		const mockNube: Partial<NubeSDK> = {
			send: vi.fn(),
		};

		// Execute App function with mock
		App(mockNube as NubeSDK);

		// Verify if send was called with correct parameters
		expect(mockNube.send).toHaveBeenCalledWith(
			"ui:slot:set",
			expect.any(Function),
		);

		// Get the slot setter function
		const slotSetter = (mockNube.send as ReturnType<typeof vi.fn>).mock
			.calls[0][1] as (state: NubeSDKState) => {
			ui: { slots: { after_line_items: unknown } };
		};

		// Execute the slot setter function
		const result = slotSetter({} as NubeSDKState);

		// Verify if the slot was set with MyCustomField component
		expect(result).toEqual({
			ui: {
				slots: {
					after_line_items: expect.objectContaining({
						type: "box",
						width: 100,
						height: 100,
					}),
				},
			},
		});
	});
});
