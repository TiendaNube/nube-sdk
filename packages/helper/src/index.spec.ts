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
		// instance management + ergonomic helpers
		expect(typeof mod.setNubeInstance).toBe("function");
		expect(typeof mod.getNubeInstance).toBe("function");
		expect(typeof mod.getCart).toBe("function");
		expect(typeof mod.onEvent).toBe("function");
		expect(typeof mod.toastOn).toBe("function");
		expect(typeof mod.ui).toBe("object");
	});
});
