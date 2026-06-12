import type { NubeSDKState } from "@tiendanube/nube-sdk-types";
import { afterEach, describe, expect, it } from "vitest";
import { createMockSDK, createMockState } from "../internal/test-utils.js";
import { clearNubeInstance, setNubeInstance } from "./instance.js";
import {
	getCart,
	getCartItems,
	getCustomer,
	getPageType,
} from "./selectors.js";

const items = [{ id: 1 }, { id: 2 }] as never;
const customer = { id: 7 } as never;

function buildState(): NubeSDKState {
	return createMockState({
		cart: { items } as never,
		customer,
		location: {
			url: "",
			page: { type: "product", data: undefined },
			queries: {},
		} as never,
	});
}

describe("selectors", () => {
	afterEach(() => {
		clearNubeInstance();
	});

	describe("with an explicit state", () => {
		const state = buildState();

		it("getCart returns the cart", () => {
			expect(getCart(state)).toBe(state.cart);
		});

		it("getCartItems returns the items", () => {
			expect(getCartItems(state)).toBe(items);
		});

		it("getPageType returns the page type", () => {
			expect(getPageType(state)).toBe("product");
		});

		it("getCustomer returns the customer", () => {
			expect(getCustomer(state)).toBe(customer);
		});
	});

	describe("with no argument (registered instance)", () => {
		it("reads the current state from the instance", () => {
			const state = buildState();
			setNubeInstance(createMockSDK(state));

			expect(getCartItems()).toBe(items);
			expect(getPageType()).toBe("product");
			expect(getCustomer()).toBe(customer);
		});
	});
});
