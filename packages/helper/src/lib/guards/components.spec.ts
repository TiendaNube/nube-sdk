import { describe, expect, it } from "vitest";
import {
	hasProductList,
	hasSections,
	hasSingleProduct,
	isSectionWithProducts,
} from "./components.js";

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
