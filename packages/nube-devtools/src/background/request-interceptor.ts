/**
 * Intercept all HTTP requests and add the 'nube-devtools: true' header
 * when the @nube-devtools extension is active
 *
 * Uses declarativeNetRequest (Manifest v3) instead of webRequest blocking
 */

/**
 * Configure the request interceptor to add the nube-devtools header
 */
export const setupRequestInterceptor = async () => {
	try {
		// Remove all existing rules first
		const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
		const ruleIdsToRemove = existingRules.map((rule) => rule.id);

		if (ruleIdsToRemove.length > 0) {
			await chrome.declarativeNetRequest.updateDynamicRules({
				removeRuleIds: ruleIdsToRemove,
			});
		}

		// Add new rule to modify headers
		await chrome.declarativeNetRequest.updateDynamicRules({
			addRules: [
				{
					id: 1,
					priority: 1,
					action: {
						type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
						requestHeaders: [
							{
								header: "nube-devtools",
								operation: chrome.declarativeNetRequest.HeaderOperation.SET,
								value: "true",
							},
						],
					},
					condition: {
						urlFilter: "*",
						resourceTypes: [
							chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
							chrome.declarativeNetRequest.ResourceType.SUB_FRAME,
							chrome.declarativeNetRequest.ResourceType.STYLESHEET,
							chrome.declarativeNetRequest.ResourceType.SCRIPT,
							chrome.declarativeNetRequest.ResourceType.IMAGE,
							chrome.declarativeNetRequest.ResourceType.FONT,
							chrome.declarativeNetRequest.ResourceType.OBJECT,
							chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
							chrome.declarativeNetRequest.ResourceType.PING,
							chrome.declarativeNetRequest.ResourceType.CSP_REPORT,
							chrome.declarativeNetRequest.ResourceType.MEDIA,
							chrome.declarativeNetRequest.ResourceType.WEBSOCKET,
							chrome.declarativeNetRequest.ResourceType.OTHER,
						],
					},
				},
			],
		});
	} catch (error) {
		console.error("Error configuring declarativeNetRequest:", error);
	}
};
