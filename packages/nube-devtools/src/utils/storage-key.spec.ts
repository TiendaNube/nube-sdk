import { describe, expect, it } from "vitest";
import { STORAGE_KEY_PATTERN, parseStorageKey } from "./storage-key";

const UUID = "3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b";

describe("parseStorageKey", () => {
	it("reads a numeric app id as app scope", () => {
		expect(parseStorageKey("app-123-cart")).toEqual({
			appId: "123",
			scope: "app",
			key: "cart",
		});
	});

	it("reads a UUID app id as app scope", () => {
		expect(parseStorageKey(`app-${UUID}-prefs`)).toEqual({
			appId: UUID,
			scope: "app",
			key: "prefs",
		});
	});

	it("reads the script of a multi-script app as script scope", () => {
		expect(parseStorageKey("app-123_901-cart")).toEqual({
			appId: "123",
			scriptId: "901",
			scope: "script",
			key: "cart",
		});
		expect(parseStorageKey(`app-${UUID}_2-pr344_key`)).toEqual({
			appId: UUID,
			scriptId: "2",
			scope: "script",
			key: "pr344_key",
		});
	});

	it("keeps dashes and underscores of the app's own key", () => {
		expect(parseStorageKey("app-123_1-my-key_v2")).toEqual({
			appId: "123",
			scriptId: "1",
			scope: "script",
			key: "my-key_v2",
		});
		expect(parseStorageKey("app-123-_draft")).toEqual({
			appId: "123",
			scope: "app",
			key: "_draft",
		});
	});

	it("ignores keys that NubeSDK did not write", () => {
		expect(parseStorageKey("theme")).toBeNull();
		expect(parseStorageKey("app-abc-key")).toBeNull();
		expect(parseStorageKey("app-123_x-key")).toBeNull();
	});

	it("is matched by the pattern the injected scripts use", () => {
		expect(STORAGE_KEY_PATTERN.test(`app-${UUID}_1-k`)).toBe(true);
		expect(STORAGE_KEY_PATTERN.test("app-123-k")).toBe(true);
	});
});
