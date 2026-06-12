import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createMockSDK, createMockState } from "../internal/test-utils.js";
import {
	getAppData,
	getCurrentState,
	getScriptParam,
	getScriptSearchParams,
	getScriptURL,
} from "./getters.js";
import { clearNubeInstance, setNubeInstance } from "./instance.js";

interface GlobalWithAppData {
	self: { __APP_DATA__: { id: string; script: string } };
}

const SCRIPT_URL = "https://cdn.example.com/app.js?version=2&flag=on";

describe("getters", () => {
	beforeEach(() => {
		(globalThis as unknown as GlobalWithAppData).self = {
			__APP_DATA__: { id: "app-123", script: SCRIPT_URL },
		};
	});

	afterEach(() => {
		clearNubeInstance();
	});

	describe("getCurrentState", () => {
		it("returns the state from the registered instance", () => {
			const state = createMockState({ store: { name: "Acme" } as never });
			setNubeInstance(createMockSDK(state));

			expect(getCurrentState()).toBe(state);
		});
	});

	describe("getAppData", () => {
		it("returns the global app data", () => {
			expect(getAppData()).toEqual({ id: "app-123", script: SCRIPT_URL });
		});
	});

	describe("script URL helpers", () => {
		it("parses the script URL", () => {
			const url = getScriptURL();
			expect(url.origin).toBe("https://cdn.example.com");
			expect(url.pathname).toBe("/app.js");
		});

		it("exposes the search params", () => {
			expect(getScriptSearchParams().get("version")).toBe("2");
		});

		it("reads a single param by key", () => {
			expect(getScriptParam("flag")).toBe("on");
			expect(getScriptParam("missing")).toBeNull();
		});
	});
});
