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
						type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
						requestHeaders: [
							{
								header: DEVTOOLS_HEADER_NAME,
								operation: chrome.declarativeNetRequest.HeaderOperation.SET,
								value: DEVTOOLS_HEADER_VALUE,
							},
						],
					},
					condition: {
						urlFilter: "*",
						resourceTypes: [
							chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
						],
					},
				},
			],
		});
	} catch (error) {
		console.error("[NubeSDK DevTools] failed to register header rule", error);
	}
}
