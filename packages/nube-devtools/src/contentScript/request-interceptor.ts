/**
 * Request interceptor via Content Script
 *
 * This script ensures that ALL JavaScript requests (fetch, XMLHttpRequest)
 * contain the 'nube-devtools: true' header, complementing the declarativeNetRequest
 */

/**
 * Intercept and modify all fetch() calls to add the header
 */
const originalFetch = window.fetch;
window.fetch = (...args: Parameters<typeof fetch>): Promise<Response> => {
	const [input, init = {}] = args;

	// Ensure headers exists
	const headers = new Headers(init.headers);

	headers.set("nube-devtools", "true");

	return originalFetch(input, {
		...init,
		headers,
	});
};

/**
 * Intercept and modify all XMLHttpRequest instances
 */
const OriginalXMLHttpRequest = window.XMLHttpRequest;
window.XMLHttpRequest = class extends OriginalXMLHttpRequest {
	private nubeDevtoolsHeaderAdded = false;

	open(
		method: string,
		url: string | URL,
		async = true,
		user?: string | null,
		password?: string | null,
	): void {
		super.open(method, url, async, user, password);
		this.nubeDevtoolsHeaderAdded = false;
	}

	setRequestHeader(name: string, value: string): void {
		// Add the nube-devtools header if it was not added
		if (!this.nubeDevtoolsHeaderAdded) {
			super.setRequestHeader("nube-devtools", "true");
			this.nubeDevtoolsHeaderAdded = true;
		}
		super.setRequestHeader(name, value);
	}

	send(body?: Document | XMLHttpRequestBodyInit | null): void {
		// Ensure the header is added even if setRequestHeader was not called
		if (!this.nubeDevtoolsHeaderAdded) {
			super.setRequestHeader("nube-devtools", "true");
			this.nubeDevtoolsHeaderAdded = true;
		}
		super.send(body);
	}
};
