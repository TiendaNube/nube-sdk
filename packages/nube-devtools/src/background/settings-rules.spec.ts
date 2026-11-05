import { beforeAll, describe, expect, it, vi } from "vitest";
import {
	DEFAULT_SETTINGS,
	changesPageLoad,
	normalizeSettings,
} from "../utils/settings";
import {
	AUTO_SLOTS_HEADER_NAME,
	DEVTOOLS_HEADER_NAME,
	SDK_ADAPTER_URL_REGEX,
	buildSettingsRules,
} from "./settings-rules";

// The rule enums only exist on the extension's `chrome` object.
beforeAll(() => {
	vi.stubGlobal("chrome", {
		declarativeNetRequest: {
			HeaderOperation: { SET: "set" },
			ResourceType: { MAIN_FRAME: "main_frame", SCRIPT: "script" },
			RuleActionType: {
				ALLOW: "allow",
				MODIFY_HEADERS: "modifyHeaders",
				REDIRECT: "redirect",
			},
		},
	});
});

const UNSTABLE_URL =
	"https://nsk-cdn-static.tiendanube.com/vanilla-adapter-unstable.fbdbeb3.0-auto-slots.min.js";

describe("normalizeSettings", () => {
	it("defaults everything to off", () => {
		expect(normalizeSettings(undefined)).toEqual(DEFAULT_SETTINGS);
		expect(normalizeSettings("nope")).toEqual(DEFAULT_SETTINGS);
	});

	it("turns Force SDK From URL off without a valid URL", () => {
		expect(
			normalizeSettings({ forceSdkFromUrl: true, sdkUrl: "not a url" })
				.forceSdkFromUrl,
		).toBe(false);
		expect(
			normalizeSettings({
				forceSdkFromUrl: true,
				sdkUrl: "javascript:alert(1)",
			}).forceSdkFromUrl,
		).toBe(false);
	});

	it("keeps only one of auto-slots and Force SDK From URL", () => {
		expect(
			normalizeSettings({
				forceSdkAutoSlots: true,
				forceSdkFromUrl: true,
				sdkUrl: UNSTABLE_URL,
			}),
		).toMatchObject({ forceSdkAutoSlots: false, forceSdkFromUrl: true });
	});

	it("keeps auto-slots when the URL is not valid", () => {
		expect(
			normalizeSettings({
				forceSdkAutoSlots: true,
				forceSdkFromUrl: true,
				sdkUrl: "not a url",
			}),
		).toMatchObject({ forceSdkAutoSlots: true, forceSdkFromUrl: false });
	});

	it("keeps a valid URL, trimmed", () => {
		expect(
			normalizeSettings({ forceSdkFromUrl: true, sdkUrl: ` ${UNSTABLE_URL} ` }),
		).toMatchObject({ forceSdkFromUrl: true, sdkUrl: UNSTABLE_URL });
	});
});

describe("changesPageLoad", () => {
	const fromUrl = {
		...DEFAULT_SETTINGS,
		forceSdkFromUrl: true,
		sdkUrl: UNSTABLE_URL,
	};

	it("is true when a switch changes", () => {
		expect(changesPageLoad(DEFAULT_SETTINGS, fromUrl)).toBe(true);
		expect(changesPageLoad(fromUrl, DEFAULT_SETTINGS)).toBe(true);
		expect(
			changesPageLoad(DEFAULT_SETTINGS, {
				...DEFAULT_SETTINGS,
				forceSdkAutoSlots: true,
			}),
		).toBe(true);
	});

	it("is true when the URL changes while it is in use", () => {
		expect(
			changesPageLoad(fromUrl, {
				...fromUrl,
				sdkUrl: "https://example.com/a.js",
			}),
		).toBe(true);
	});

	it("is false when the URL changes while it is not in use", () => {
		expect(
			changesPageLoad(DEFAULT_SETTINGS, {
				...DEFAULT_SETTINGS,
				sdkUrl: UNSTABLE_URL,
			}),
		).toBe(false);
	});
});

describe("buildSettingsRules", () => {
	it("always sends the devtools header, and nothing else by default", () => {
		const rules = buildSettingsRules(DEFAULT_SETTINGS);
		expect(rules).toHaveLength(1);
		expect(rules[0].action.requestHeaders?.map((h) => h.header)).toEqual([
			DEVTOOLS_HEADER_NAME,
		]);
		expect(rules[0].condition.resourceTypes).toEqual(["main_frame"]);
	});

	it("adds the auto-slots header to the same rule", () => {
		const rules = buildSettingsRules({
			...DEFAULT_SETTINGS,
			forceSdkAutoSlots: true,
		});
		expect(rules).toHaveLength(1);
		expect(rules[0].action.requestHeaders).toContainEqual({
			header: AUTO_SLOTS_HEADER_NAME,
			operation: "set",
			value: "true",
		});
		expect(rules[0].action.requestHeaders).toHaveLength(2);
	});

	it("redirects the adapter and lets the target URL through", () => {
		const [, redirect, allow] = buildSettingsRules({
			...DEFAULT_SETTINGS,
			forceSdkFromUrl: true,
			sdkUrl: UNSTABLE_URL,
		});
		expect(redirect.action).toEqual({
			type: "redirect",
			redirect: { url: UNSTABLE_URL },
		});
		expect(allow.action.type).toBe("allow");
		expect(allow.priority).toBeGreaterThan(redirect.priority ?? 1);

		// The target matches the redirect filter, so only the allow rule stops a loop.
		expect(new RegExp(SDK_ADAPTER_URL_REGEX).test(UNSTABLE_URL)).toBe(true);
		expect(
			new RegExp(allow.condition.regexFilter ?? "").test(UNSTABLE_URL),
		).toBe(true);
	});

	it("matches the adapter URLs stores load", () => {
		const filter = new RegExp(SDK_ADAPTER_URL_REGEX);
		expect(
			filter.test(
				"https://nsk-cdn-static.tiendanube.com/vanilla-adapter-0.39.0.min.js",
			),
		).toBe(true);
		expect(
			filter.test(
				"https://nsk-cdn-static.tiendanube.com/vidstack-0.1.0.min.js",
			),
		).toBe(false);
	});
});
