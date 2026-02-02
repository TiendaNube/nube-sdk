import type { Page } from "@tiendanube/nube-sdk-types";
import { describe, expect, it } from "vitest";
import {
	hasProductList,
	hasSections,
	hasSingleProduct,
	isCategoryPage,
	isCheckoutPage,
	isHomePage,
	isProductPage,
	isSectionWithProducts,
} from "./typeguards.js";

describe("Type Guards", () => {
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

	describe("Data shape guards", () => {
		it("hasProductList returns true for object with products array", () => {
			expect(hasProductList({ products: [] })).toBe(true);
			expect(
				hasProductList({
					products: [{ id: 1, name: {}, description: {}, handle: {} }],
				}),
			).toBe(true);
		});

		it("hasProductList returns false for non-array or missing products", () => {
			expect(hasProductList({})).toBe(false);
			expect(hasProductList({ products: "not array" })).toBe(false);
			expect(hasProductList(null)).toBe(false);
		});

		it("hasSections returns true for object with sections array", () => {
			expect(hasSections({ sections: [] })).toBe(true);
			expect(hasSections({ sections: [{ type: "banner" }] })).toBe(true);
		});

		it("hasSections returns false for non-array or missing sections", () => {
			expect(hasSections({})).toBe(false);
			expect(hasSections(null)).toBe(false);
		});

		it("hasSingleProduct returns true for object with product having id", () => {
			expect(hasSingleProduct({ product: { id: 1 } })).toBe(true);
		});

		it("hasSingleProduct returns false when product or id missing", () => {
			expect(hasSingleProduct({})).toBe(false);
			expect(hasSingleProduct({ product: {} })).toBe(false);
			expect(hasSingleProduct(null)).toBe(false);
		});

		it("isSectionWithProducts returns true for object with products array", () => {
			expect(isSectionWithProducts({ products: [] })).toBe(true);
			expect(
				isSectionWithProducts({
					type: "featured_products",
					products: [{ id: 1 }],
				}),
			).toBe(true);
		});

		it("isSectionWithProducts returns false when products missing", () => {
			expect(isSectionWithProducts({ type: "banner" })).toBe(false);
			expect(isSectionWithProducts(null)).toBe(false);
		});
	});
});
