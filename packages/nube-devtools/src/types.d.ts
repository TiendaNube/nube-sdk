declare global {
	interface Window {
		__NUBE_DEVTOOLS_EXTENSION__: boolean;
		__NUBE_DEVTOOLS_EXTENSION_CUSTOM_EVENTS__: boolean;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		nubeSDK: any;
	}
}

export type {};
