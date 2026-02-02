import { describe, expect, it } from "vitest";

describe("index exports", () => {
	it("should export modules without throwing", async () => {
		const mod = await import("./index.js");
		expect(mod).toBeTruthy();
		// spot-check common exports exist
		expect(typeof mod.pageMatch).toBe("function");
		expect(typeof mod.deepClone).toBe("function");
		expect(typeof mod.getProductsFromState).toBe("function");
		expect(typeof mod.isProductPage).toBe("function");
	});
});
