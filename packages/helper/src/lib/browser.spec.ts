import type { NubeBrowserAPIs, NubeSDK } from "@tiendanube/nube-sdk-types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockSDK } from "../internal/test-utils.js";
import { browser, clearBrowserCache, navigate } from "./browser.js";
import { clearNubeInstance, setNubeInstance } from "./instance.js";

function createSDKWithBrowserAPIs(): {
	sdk: NubeSDK;
	apis: NubeBrowserAPIs;
	getBrowserAPIs: ReturnType<typeof vi.fn>;
} {
	const apis = {
		navigate: vi.fn(),
		asyncLocalStorage: { getItem: vi.fn(), setItem: vi.fn() },
	} as unknown as NubeBrowserAPIs;

	const getBrowserAPIs = vi.fn(() => apis);
	const sdk = createMockSDK();
	(sdk as { getBrowserAPIs: unknown }).getBrowserAPIs = getBrowserAPIs;

	return { sdk, apis, getBrowserAPIs };
}

describe("browser", () => {
	beforeEach(() => {
		clearBrowserCache();
	});

	afterEach(() => {
		clearNubeInstance();
		clearBrowserCache();
	});

	it("lazily resolves browser APIs from the registered instance", () => {
		const { sdk, apis, getBrowserAPIs } = createSDKWithBrowserAPIs();
		setNubeInstance(sdk);

		expect(getBrowserAPIs).not.toHaveBeenCalled();

		browser.navigate("/products/1");

		expect(getBrowserAPIs).toHaveBeenCalledTimes(1);
		expect(apis.navigate).toHaveBeenCalledWith("/products/1");
	});

	it("caches the resolved APIs across accesses", () => {
		const { sdk, getBrowserAPIs } = createSDKWithBrowserAPIs();
		setNubeInstance(sdk);

		browser.navigate("/a");
		browser.navigate("/b");

		expect(getBrowserAPIs).toHaveBeenCalledTimes(1);
	});

	it("navigate() delegates to the browser API", () => {
		const { sdk, apis } = createSDKWithBrowserAPIs();
		setNubeInstance(sdk);

		navigate("/cart");

		expect(apis.navigate).toHaveBeenCalledWith("/cart");
	});

	it("clearBrowserCache forces a fresh resolution", () => {
		const { sdk, getBrowserAPIs } = createSDKWithBrowserAPIs();
		setNubeInstance(sdk);

		browser.navigate("/a");
		clearBrowserCache();
		browser.navigate("/b");

		expect(getBrowserAPIs).toHaveBeenCalledTimes(2);
	});
});
