import type { NubeSDK, NubeSDKState } from "@tiendanube/nube-sdk-types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockSDK, createMockState } from "../internal/test-utils.js";
import { onEvent, toastOn } from "./events.js";
import { clearNubeInstance, setNubeInstance } from "./instance.js";

describe("events", () => {
	let sdk: NubeSDK;

	beforeEach(() => {
		sdk = createMockSDK();
		setNubeInstance(sdk);
	});

	afterEach(() => {
		clearNubeInstance();
	});

	describe("onEvent", () => {
		it("registers the listener on the instance", () => {
			const listener = vi.fn();
			onEvent("cart:update", listener);

			expect(sdk.on).toHaveBeenCalledWith("cart:update", listener);
		});

		it("returns an unsubscribe that detaches the same listener", () => {
			const listener = vi.fn();
			const unsubscribe = onEvent("cart:update", listener);

			unsubscribe();

			expect(sdk.off).toHaveBeenCalledWith("cart:update", listener);
		});
	});

	describe("toastOn", () => {
		function fireRegisteredListener(state: NubeSDKState): void {
			const registered = (sdk.on as ReturnType<typeof vi.fn>).mock
				.calls[0]?.[1];
			registered?.(state);
		}

		it("shows a static toast when the event fires", () => {
			toastOn("cart:add:success", "Added to cart", "success");

			fireRegisteredListener(createMockState());

			expect(sdk.render).toHaveBeenCalledWith("corner_top_right", {
				type: "toastRoot",
				variant: "success",
				children: [{ type: "toastTitle", children: "Added to cart" }],
			});
		});

		it("supports a message derived from state", () => {
			const state = createMockState({
				cart: { items: [{ id: 1 }, { id: 2 }] } as never,
			});
			toastOn("cart:update", (s) => `Items: ${s.cart.items.length}`);

			fireRegisteredListener(state);

			expect(sdk.render).toHaveBeenCalledWith(
				"corner_top_right",
				expect.objectContaining({
					children: [{ type: "toastTitle", children: "Items: 2" }],
				}),
			);
		});

		it("returns an unsubscribe function", () => {
			const unsubscribe = toastOn("cart:update", "hi");
			unsubscribe();

			expect(sdk.off).toHaveBeenCalledWith("cart:update", expect.any(Function));
		});
	});
});
