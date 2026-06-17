import type { Page } from "@tiendanube/nube-sdk-types";
import { describe, expect, it } from "vitest";
import {
	isCategoryPage,
	isCheckoutPage,
	isHomePage,
	isProductPage,
} from "./pages.js";

describe("Page type guards", () => {
	it("isProductPage returns true for product page", () => {
		const page = {
			type: "product",
			data: { product: { id: 1 } },
		} as unknown as Page;
		expect(isProductPage(page)).toBe(true);
	});

	it("isProductPage returns false for other page types", () => {
		expect(
			isProductPage({ type: "category", data: {} } as unknown as Page),
		).toBe(false);
		expect(
			isProductPage({ type: "checkout", data: {} } as unknown as Page),
		).toBe(false);
		expect(isProductPage({ type: "home", data: {} } as unknown as Page)).toBe(
			false,
		);
	});

	it("isCategoryPage returns true for category page", () => {
		expect(
			isCategoryPage({ type: "category", data: {} } as unknown as Page),
		).toBe(true);
	});

	it("isCheckoutPage returns true for checkout page", () => {
		expect(
			isCheckoutPage({ type: "checkout", data: {} } as unknown as Page),
		).toBe(true);
	});

	it("isHomePage returns true for home page", () => {
		expect(isHomePage({ type: "home", data: {} } as unknown as Page)).toBe(
			true,
		);
	});
});
