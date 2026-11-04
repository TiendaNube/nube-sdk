import {
	type DevToolsSettings,
	SETTINGS_STORAGE_KEY,
	isValidSdkUrl,
	loadSettings,
	normalizeSettings,
} from "../utils/settings";

export const DEVTOOLS_HEADER_NAME = "X-Nube-Devtools";
export const AUTO_SLOTS_HEADER_NAME = "X-Nube-AutoSlots";
const HEADER_VALUE = "true";

// Rule 1 sends X-Nube-Devtools on every page load, whatever the settings, and
// X-Nube-AutoSlots when that setting is on.
const HEADERS_RULE_ID = 1;
const SDK_URL_REDIRECT_RULE_ID = 2;
const SDK_URL_TARGET_RULE_ID = 3;
const SETTINGS_RULE_IDS = [
	HEADERS_RULE_ID,
	SDK_URL_REDIRECT_RULE_ID,
	SDK_URL_TARGET_RULE_ID,
];

/** The vanilla-adapter bundles stores load from the SDK CDN, in any version or variant. */
export const SDK_ADAPTER_URL_REGEX =
	"^https://nsk-cdn-static\\.tiendanube\\.com/vanilla-adapter-[^/]+\\.min\\.js$";

function escapeRegex(text: string): string {
	return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** The network rules that apply the settings. */
export function buildSettingsRules(
	settings: DevToolsSettings,
): chrome.declarativeNetRequest.Rule[] {
	const { HeaderOperation, ResourceType, RuleActionType } =
		chrome.declarativeNetRequest;
	const requestHeaders: chrome.declarativeNetRequest.ModifyHeaderInfo[] = [
		{
			header: DEVTOOLS_HEADER_NAME,
			operation: HeaderOperation.SET,
			value: HEADER_VALUE,
		},
	];
	if (settings.forceSdkAutoSlots) {
		requestHeaders.push({
			header: AUTO_SLOTS_HEADER_NAME,
			operation: HeaderOperation.SET,
			value: HEADER_VALUE,
		});
	}

	const rules: chrome.declarativeNetRequest.Rule[] = [
		{
			id: HEADERS_RULE_ID,
			priority: 1,
			action: {
				type: RuleActionType.MODIFY_HEADERS,
				requestHeaders,
			},
			condition: {
				urlFilter: "*",
				resourceTypes: [ResourceType.MAIN_FRAME],
			},
		},
	];

	if (settings.forceSdkFromUrl && isValidSdkUrl(settings.sdkUrl)) {
		rules.push({
			id: SDK_URL_REDIRECT_RULE_ID,
			priority: 1,
			action: {
				type: RuleActionType.REDIRECT,
				redirect: { url: settings.sdkUrl },
			},
			condition: {
				regexFilter: SDK_ADAPTER_URL_REGEX,
				resourceTypes: [ResourceType.SCRIPT],
			},
		});
		// The URL can itself be an adapter on the SDK CDN (e.g. an unstable
		// build): letting it through keeps the redirect from looping.
		rules.push({
			id: SDK_URL_TARGET_RULE_ID,
			priority: 2,
			action: { type: RuleActionType.ALLOW },
			condition: {
				regexFilter: `^${escapeRegex(settings.sdkUrl)}$`,
				resourceTypes: [ResourceType.SCRIPT],
			},
		});
	}

	return rules;
}

/** Replaces the settings rules with the ones for `settings` (the stored ones by default). */
export async function syncSettingsRules(settings?: DevToolsSettings) {
	try {
		const current = settings ?? (await loadSettings());
		await chrome.declarativeNetRequest.updateDynamicRules({
			removeRuleIds: SETTINGS_RULE_IDS,
			addRules: buildSettingsRules(current),
		});
	} catch (error) {
		console.error(
			"[NubeSDK DevTools] failed to update the settings rules",
			error,
		);
	}
}

/** Stores the settings and applies them. Resolves once the rules are in place. */
export async function saveSettings(value: unknown): Promise<DevToolsSettings> {
	const settings = normalizeSettings(value);
	await chrome.storage.local.set({ [SETTINGS_STORAGE_KEY]: settings });
	await syncSettingsRules(settings);
	return settings;
}
