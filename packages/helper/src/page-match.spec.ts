import type { NubeSDK, NubeSDKState } from "@tiendanube/nube-sdk-types";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { onCheckoutStep, onPage, pageMatch } from "./page-match.js";
import type { CheckoutStepHandlers, PageHandlers } from "./page-match.js";

function createMockSDK(): NubeSDK {
	const mockSDK = {
		on: vi.fn(),
	} as Partial<NubeSDK>;

	return mockSDK as NubeSDK;
}

function setMockSDKOnGlobal(): NubeSDK {
	const sdk = createMockSDK();
	interface GlobalWithSDK {
		self: { __SDK_INSTANCE__: NubeSDK };
	}
	(globalThis as unknown as GlobalWithSDK).self = {
		__SDK_INSTANCE__: sdk,
	};
	return sdk;
}

function makeState(page: unknown): NubeSDKState {
	return { location: { page } } as unknown as NubeSDKState;
}

describe("page-match", () => {
	beforeEach(() => {
		setMockSDKOnGlobal();
	});

	describe("pageMatch", () => {
		it("dispatches to product handler with state and data", () => {
			const productHandler = vi.fn();
			const handlers = { product: productHandler } as const;
			const state = makeState({ type: "product", data: { id: 1 } });

			pageMatch(state, handlers);

			expect(productHandler).toHaveBeenCalledTimes(1);
			expect(productHandler).toHaveBeenCalledWith(
				state,
				state.location.page.data,
			);
		});

		it("dispatches to checkout handler when page is checkout", () => {
			const checkoutHandler = vi.fn();
			const handlers = { checkout: checkoutHandler } as const;
			const state = makeState({
				type: "checkout",
				data: { step: "success" },
			});

			pageMatch(state, handlers);

			expect(checkoutHandler).toHaveBeenCalledTimes(1);
			expect(checkoutHandler).toHaveBeenCalledWith(
				state,
				state.location.page.data,
			);
		});

		it("dispatches to category handler when page is category", () => {
			const categoryHandler = vi.fn();
			const handlers = { category: categoryHandler } as const;
			const state = makeState({
				type: "category",
				data: { id: 99, name: "X" },
			});

			pageMatch(state, handlers);

			expect(categoryHandler).toHaveBeenCalledTimes(1);
			expect(categoryHandler).toHaveBeenCalledWith(
				state,
				state.location.page.data,
			);
		});

		it("does nothing if handler for page type is not provided", () => {
			const handlers = {} as PageHandlers;
			const state = makeState({ type: "category", data: { id: 10 } });

			// should not throw
			expect(() => pageMatch(state, handlers)).not.toThrow();
		});

		it("does not throw for unknown page type (default branch)", () => {
			const handlers = {} as PageHandlers;
			const state = makeState({ type: "unknown", data: {} });

			// exercises default case
			expect(() => pageMatch(state, handlers)).not.toThrow();
		});
	});

	describe("onPage", () => {
		it("subscribes to location:updated event", () => {
			const sdk = setMockSDKOnGlobal();
			const productHandler = vi.fn();

			onPage({ product: productHandler });

			expect(sdk.on).toHaveBeenCalledTimes(1);
			expect(sdk.on).toHaveBeenCalledWith(
				"location:updated",
				expect.any(Function),
			);
		});
	});

	describe("onCheckoutStep", () => {
		it("subscribes to checkout:ready event", () => {
			const sdk = setMockSDKOnGlobal();
			const successHandler = vi.fn();

			onCheckoutStep({ success: successHandler } as CheckoutStepHandlers);

			expect(sdk.on).toHaveBeenCalledTimes(1);
			expect(sdk.on).toHaveBeenCalledWith(
				"checkout:ready",
				expect.any(Function),
			);
		});

		it("registers handler for specific checkout step", () => {
			const sdk = setMockSDKOnGlobal();
			const successHandler = vi.fn();
			const paymentHandler = vi.fn();

			onCheckoutStep({
				success: successHandler,
				payment: paymentHandler,
			} as CheckoutStepHandlers);

			expect(sdk.on).toHaveBeenCalledTimes(1);
			expect(sdk.on).toHaveBeenCalledWith(
				"checkout:ready",
				expect.any(Function),
			);
		});
	});
});
