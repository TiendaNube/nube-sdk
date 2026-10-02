import type { NubeSDK, NubeSDKState } from "@tiendanube/nube-sdk-types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockSDK, createMockState } from "../internal/test-utils.js";
import { clearNubeInstance, setNubeInstance } from "./instance.js";
import { onCheckoutStep, onPage, pageMatch } from "./page-match.js";
import type { CheckoutStepHandlers, PageHandlers } from "./page-match.js";

function registerMockSDK(): NubeSDK {
	const sdk = createMockSDK(createMockState());
	setNubeInstance(sdk);
	return sdk;
}

function makeState(page: unknown): NubeSDKState {
	return { location: { page } } as unknown as NubeSDKState;
}

describe("page-match", () => {
	beforeEach(() => {
		registerMockSDK();
	});

	afterEach(() => {
		clearNubeInstance();
	});

	describe("pageMatch", () => {
		it("dispatches to product handler with state and product data", () => {
			const productHandler = vi.fn();
			const handlers = { product: productHandler } as const;
			const productData = { id: 1 };
			const state = makeState({
				type: "product",
				data: { product: productData },
			});

			pageMatch(state, handlers);

			expect(productHandler).toHaveBeenCalledTimes(1);
			expect(productHandler).toHaveBeenCalledWith(state, productData);
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

		it("dispatches to home handler when page is home", () => {
			const homeHandler = vi.fn();
			const handlers = { home: homeHandler } as const;
			const state = makeState({
				type: "home",
				data: { sections: [] },
			});

			pageMatch(state, handlers);

			expect(homeHandler).toHaveBeenCalledTimes(1);
			expect(homeHandler).toHaveBeenCalledWith(state, state.location.page.data);
		});

		it("dispatches to account handler for any account page", () => {
			const accountHandler = vi.fn();
			const handlers = { account: accountHandler } as const;
			const state = makeState({
				type: "account.login",
				data: {
					customerId: null,
					loggedIn: false,
					orderId: null,
					orderNumber: null,
				},
			});

			pageMatch(state, handlers);

			expect(accountHandler).toHaveBeenCalledTimes(1);
			expect(accountHandler).toHaveBeenCalledWith(
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
		it("subscribes to page:loaded event", () => {
			const sdk = registerMockSDK();
			const productHandler = vi.fn();

			onPage({ product: productHandler });

			expect(sdk.on).toHaveBeenCalledTimes(1);
			expect(sdk.on).toHaveBeenCalledWith("page:loaded", expect.any(Function));
		});

		it("returns an unsubscribe that detaches the same listener", () => {
			const sdk = registerMockSDK();

			const unsubscribe = onPage({ product: vi.fn() });
			const registeredListener = (sdk.on as ReturnType<typeof vi.fn>).mock
				.calls[0]?.[1];

			expect(typeof unsubscribe).toBe("function");

			unsubscribe();

			expect(sdk.off).toHaveBeenCalledWith("page:loaded", registeredListener);
		});
	});

	describe("onCheckoutStep", () => {
		it("subscribes to checkout:ready event", () => {
			const sdk = registerMockSDK();
			const successHandler = vi.fn();

			onCheckoutStep({ success: successHandler } as CheckoutStepHandlers);

			expect(sdk.on).toHaveBeenCalledTimes(1);
			expect(sdk.on).toHaveBeenCalledWith(
				"checkout:ready",
				expect.any(Function),
			);
		});

		it("registers handler for specific checkout step", () => {
			const sdk = registerMockSDK();
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

		it("returns an unsubscribe that detaches the same listener", () => {
			const sdk = registerMockSDK();

			const unsubscribe = onCheckoutStep({
				success: vi.fn(),
			} as CheckoutStepHandlers);
			const registeredListener = (sdk.on as ReturnType<typeof vi.fn>).mock
				.calls[0]?.[1];

			unsubscribe();

			expect(sdk.off).toHaveBeenCalledWith(
				"checkout:ready",
				registeredListener,
			);
		});

		/**
		 * A host whose `checkout:ready` is sticky: once dispatched it is kept
		 * and handed to the app's first `on("checkout:ready")`, synchronously,
		 * inside that `on` call. `pending` says whether that replay is still
		 * owed to this app.
		 */
		function registerStickyReadySDK(step: string, pending: boolean) {
			const state = makeState({ type: "checkout", data: { step } });
			const sdk = createMockSDK(state);
			const listeners: Array<(state: NubeSDKState) => void> = [];
			let replayOwed = pending;
			sdk.on = vi.fn((event: string, listener: (s: NubeSDKState) => void) => {
				if (event !== "checkout:ready") return;
				listeners.push(listener);
				if (replayOwed) {
					replayOwed = false;
					listener(state);
				}
			}) as unknown as NubeSDK["on"];
			setNubeInstance(sdk);
			const emitReady = (next: NubeSDKState) => {
				for (const listener of listeners) listener(next);
			};
			return { state, emitReady };
		}

		// specs/tla/HelperEvents.tla, StepHandlerOnce (FIX_CHECKOUT_STEP_ONCE)
		it("runs the step handler once when checkout:ready is replayed on subscribe", () => {
			const { state } = registerStickyReadySDK("payment", true);
			const payment = vi.fn();

			onCheckoutStep({ payment } as CheckoutStepHandlers);

			expect(payment).toHaveBeenCalledTimes(1);
			expect(payment).toHaveBeenCalledWith(state);
		});

		it("runs the step handler once for a late registration with no replay", () => {
			const { state } = registerStickyReadySDK("payment", false);
			const payment = vi.fn();

			onCheckoutStep({ payment } as CheckoutStepHandlers);

			expect(payment).toHaveBeenCalledTimes(1);
			expect(payment).toHaveBeenCalledWith(state);
		});

		it("keeps handling checkout:ready dispatched after subscribing", () => {
			const { emitReady } = registerStickyReadySDK("cart", true);
			const cart = vi.fn();
			const payment = vi.fn();

			onCheckoutStep({ cart, payment } as CheckoutStepHandlers);
			emitReady(makeState({ type: "checkout", data: { step: "payment" } }));

			expect(cart).toHaveBeenCalledTimes(1);
			expect(payment).toHaveBeenCalledTimes(1);
		});
	});
});
