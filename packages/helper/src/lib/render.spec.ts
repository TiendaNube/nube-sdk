import type {
	NubeComponent,
	NubeSDKState,
	ProductDetails,
} from "@tiendanube/nube-sdk-types";
import { describe, expect, it, vi } from "vitest";
import { forEachProduct, getProductsFromState } from "./render.js";

const createMockProduct = (id: number): ProductDetails => ({
	id,
	name: { en: `Product ${id}`, pt: `Produto ${id}` },
	description: { en: `Description ${id}`, pt: `Descrição ${id}` },
	handle: { en: `product-${id}`, pt: `produto-${id}` },
	canonical_url: `https://example.com/product-${id}`,
	brand: null,
	attributes: [],
	images: [],
	variants: [],
	published: true,
	requires_shipping: true,
	seo_title: { en: `SEO Title ${id}`, pt: `Título SEO ${id}` },
	seo_description: {
		en: `SEO Description ${id}`,
		pt: `Descrição SEO ${id}`,
	},
	tags: "",
	video_url: null,
});

const createMockState = (
	page: NubeSDKState["location"]["page"],
): NubeSDKState =>
	({
		location: {
			url: "https://example.com",
			page,
			queries: {},
		},
		device: {
			screen: {
				width: 1920,
				height: 1080,
				orientation: "landscape",
				pixelRatio: 1,
				innerWidth: 1920,
				innerHeight: 1080,
			},
			type: "desktop",
		},
		cart: {
			id: "test-cart-id",
			items: [],
			prices: {
				subtotal: 0,
				total: 0,
				discount_coupon: 0,
				discount_gateway: 0,
				discount_promotion: 0,
				shipping: 0,
				subtotal_without_taxes: 0,
			},
			validation: {
				status: "success",
			},
			coupon: {},
			is_subscription: false,
		},
		config: {
			has_cart_validation: true,
			disable_shipping_more_options: false,
		},
		store: {
			id: 1,
			name: "Test Store",
			domain: "example.com",
			currency: "USD",
			language: "en",
		},
		ui: {
			slots: {},
			values: {},
		},
		shipping: null,
		customer: null,
		payment: null,
		eventPayload: null,
		session: {
			id: "test-session-id",
		},
	}) as NubeSDKState;

describe("getProductsFromState", () => {
	it("should return empty array when page is undefined", () => {
		const state = createMockState(
			undefined as unknown as NubeSDKState["location"]["page"],
		);
		const result = getProductsFromState(state);
		expect(result).toEqual([]);
	});

	it("should extract products from category page data.products", () => {
		const products = [createMockProduct(1), createMockProduct(2)];
		const state = createMockState({
			type: "category",
			data: {
				id: 1,
				name: "Category",
				products,
			},
		});

		const result = getProductsFromState(state);
		expect(result).toEqual(products);
		expect(result).toHaveLength(2);
	});

	it("should extract products from products page data.products", () => {
		const products = [
			createMockProduct(1),
			createMockProduct(2),
			createMockProduct(3),
		];
		const state = createMockState({
			type: "products",
			data: {
				id: 0,
				name: "All Products",
				products,
			},
		});

		const result = getProductsFromState(state);
		expect(result).toEqual(products);
		expect(result).toHaveLength(3);
	});

	it("should extract products from search page data.products", () => {
		const products = [createMockProduct(5)];
		const state = createMockState({
			type: "search",
			data: {
				q: "test query",
				products,
			},
		});

		const result = getProductsFromState(state);
		expect(result).toEqual(products);
		expect(result).toHaveLength(1);
	});

	it("should extract products from sections in home page", () => {
		const sectionProducts1 = [createMockProduct(1), createMockProduct(2)];
		const sectionProducts2 = [createMockProduct(3)];
		const state = createMockState({
			type: "home",
			data: {
				sections: [
					{
						type: "featured_products",
						products: sectionProducts1,
					},
					{
						type: "new_products",
						products: sectionProducts2,
					},
				],
			},
		});

		const result = getProductsFromState(state);
		expect(result).toEqual([...sectionProducts1, ...sectionProducts2]);
		expect(result).toHaveLength(3);
	});

	it("should extract products from sections in product page", () => {
		const sectionProducts = [createMockProduct(10), createMockProduct(11)];
		const mainProduct = createMockProduct(9);
		const state = createMockState({
			type: "product",
			data: {
				product: mainProduct,
				sections: [
					{
						type: "related_products",
						products: sectionProducts,
					},
				],
			},
		});

		const result = getProductsFromState(state);
		expect(result).toEqual([...sectionProducts, mainProduct]);
		expect(result).toHaveLength(3);
		expect(result).toContain(mainProduct);
	});

	it("should extract main product from product page even without sections", () => {
		const mainProduct = createMockProduct(7);
		const state = createMockState({
			type: "product",
			data: {
				product: mainProduct,
			},
		});

		const result = getProductsFromState(state);
		expect(result).toEqual([mainProduct]);
		expect(result).toHaveLength(1);
	});

	it("should return empty array for checkout page", () => {
		const state = createMockState({
			type: "checkout",
			data: {
				step: "start",
			},
		});

		const result = getProductsFromState(state);
		expect(result).toEqual([]);
	});

	it("should handle pages with empty products array", () => {
		const state = createMockState({
			type: "category",
			data: {
				id: 1,
				name: "Category",
				products: [],
			},
		});

		const result = getProductsFromState(state);
		expect(result).toEqual([]);
	});

	it("should handle sections without products property", () => {
		const state = createMockState({
			type: "home",
			data: {
				sections: [
					{
						type: "featured_products",
						products: [createMockProduct(1)],
					},
					{
						type: "new_products",
					} as unknown as { type: "new_products"; products: ProductDetails[] },
				],
			},
		});

		const result = getProductsFromState(state);
		expect(result).toEqual([createMockProduct(1)]);
		expect(result).toHaveLength(1);
	});
});

describe("forEachProduct", () => {
	it("should return empty array when no products are available", () => {
		const state = createMockState({
			type: "checkout",
			data: {
				step: "start",
			},
		});

		const renderFactory = vi.fn(
			(): NubeComponent => ({ type: "txt", children: "test" }),
		);
		const result = forEachProduct(renderFactory)(state);

		expect(result).toEqual([]);
		expect(renderFactory).not.toHaveBeenCalled();
	});

	it("should map products to components with generated keys", () => {
		const products = [createMockProduct(1), createMockProduct(2)];
		const state = createMockState({
			type: "category",
			data: {
				id: 1,
				name: "Category",
				products,
			},
		});

		const renderFactory = (product: ProductDetails): NubeComponent => ({
			type: "txt",
			children: `Product ${product.id}`,
		});

		const result = forEachProduct(renderFactory)(state);

		expect(result).toHaveLength(2);
		expect((result[0] as { key?: number }).key).toBe(1);
		expect((result[1] as { key?: number }).key).toBe(2);
		expect(result[0]).toMatchObject({
			type: "txt",
			children: "Product 1",
		});
		expect(result[1]).toMatchObject({
			type: "txt",
			children: "Product 2",
		});
	});

	it("should filter out null components", () => {
		const products = [
			createMockProduct(1),
			createMockProduct(2),
			createMockProduct(3),
		];
		const state = createMockState({
			type: "category",
			data: {
				id: 1,
				name: "Category",
				products,
			},
		});

		const renderFactory = (product: ProductDetails): NubeComponent | null => {
			if (product.id === 2) return null;
			return { type: "txt", children: `Product ${product.id}` };
		};

		const result = forEachProduct(renderFactory)(state);

		expect(result).toHaveLength(2);
		expect((result[0] as { key?: number }).key).toBe(1);
		expect((result[1] as { key?: number }).key).toBe(3);
		expect(
			result.find((c) => (c as { key?: number }).key === 2),
		).toBeUndefined();
	});

	it("should filter out undefined components", () => {
		const products = [createMockProduct(1), createMockProduct(2)];
		const state = createMockState({
			type: "category",
			data: {
				id: 1,
				name: "Category",
				products,
			},
		});

		const renderFactory = (
			product: ProductDetails,
		): NubeComponent | undefined => {
			if (product.id === 1) return undefined;
			return { type: "txt", children: `Product ${product.id}` };
		};

		const result = forEachProduct(renderFactory)(state);

		expect(result).toHaveLength(1);
		expect((result[0] as { key?: number }).key).toBe(2);
		expect(
			result.find((c) => (c as { key?: number }).key === 1),
		).toBeUndefined();
	});

	it("should handle main product from product page", () => {
		const mainProduct = createMockProduct(5);
		const state = createMockState({
			type: "product",
			data: {
				product: mainProduct,
			},
		});

		const renderFactory = (product: ProductDetails): NubeComponent => ({
			type: "txt",
			children: `Product ${product.id}`,
		});

		const result = forEachProduct(renderFactory)(state);

		expect(result).toHaveLength(1);
		expect((result[0] as { key?: number }).key).toBe(5);
		expect(result[0]).toMatchObject({
			type: "txt",
			children: "Product 5",
		});
	});
});
