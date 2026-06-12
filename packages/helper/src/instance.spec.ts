import type { NubeSDK } from "@tiendanube/nube-sdk-types";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
	clearNubeInstance,
	getNubeInstance,
	setNubeInstance,
} from "./instance.js";
import { createMockSDK } from "./test-utils.js";

interface GlobalWithSDK {
	self?: { __SDK_INSTANCE__?: NubeSDK };
}

function setGlobalInstance(sdk?: NubeSDK): void {
	(globalThis as unknown as GlobalWithSDK).self = sdk
		? { __SDK_INSTANCE__: sdk }
		: {};
}

describe("instance", () => {
	beforeEach(() => {
		clearNubeInstance();
		setGlobalInstance(undefined);
	});

	afterEach(() => {
		clearNubeInstance();
	});

	it("returns the instance registered via setNubeInstance", () => {
		const sdk = createMockSDK();
		setNubeInstance(sdk);

		expect(getNubeInstance()).toBe(sdk);
	});

	it("falls back to self.__SDK_INSTANCE__ when none is registered", () => {
		const sdk = createMockSDK();
		setGlobalInstance(sdk);

		expect(getNubeInstance()).toBe(sdk);
	});

	it("prefers the registered instance over the global one", () => {
		const registered = createMockSDK();
		const global = createMockSDK();
		setGlobalInstance(global);
		setNubeInstance(registered);

		expect(getNubeInstance()).toBe(registered);
	});

	it("throws a descriptive error when no instance is available", () => {
		expect(() => getNubeInstance()).toThrow(/setNubeInstance/);
	});

	it("clears the registered instance", () => {
		setNubeInstance(createMockSDK());
		clearNubeInstance();

		expect(() => getNubeInstance()).toThrow();
	});
});
