const DEVTOOLS_HEADER_RULE_ID = 1;

export const DEVTOOLS_HEADER_NAME = "X-Nube-Devtools";
export const DEVTOOLS_HEADER_VALUE = "true";

export async function syncDevToolsHeaderRule() {
	try {
		await chrome.declarativeNetRequest.updateDynamicRules({
			removeRuleIds: [DEVTOOLS_HEADER_RULE_ID],
			addRules: [
				{
					id: DEVTOOLS_HEADER_RULE_ID,
					priority: 1,
					action: {
						// String values instead of the `chrome.declarativeNetRequest`
						// enums, which Firefox does not expose.
						type: "modifyHeaders" as chrome.declarativeNetRequest.RuleActionType,
						requestHeaders: [
							{
								header: DEVTOOLS_HEADER_NAME,
								operation:
									"set" as chrome.declarativeNetRequest.HeaderOperation,
								value: DEVTOOLS_HEADER_VALUE,
							},
						],
					},
					condition: {
						urlFilter: "*",
						resourceTypes: [
							"main_frame" as chrome.declarativeNetRequest.ResourceType,
						],
					},
				},
			],
		});
	} catch (error) {
		console.error("[NubeSDK DevTools] failed to register header rule", error);
	}
}
