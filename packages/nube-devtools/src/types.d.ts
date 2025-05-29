declare global {
	interface Window {
		__NUBE_SDK_APPS__: { id: number | string; worker: Worker }[];
		__NUBE_DEVTOOLS_EXTENSION__: boolean;
		__NUBE_DEVTOOLS_EXTENSION_CUSTOM_EVENTS__: boolean;
		__NUBE_SDK_CONSOLE_LISTENER?: (event: MessageEvent) => void;
		__NUBE_SDK_NETWORK_LISTENER?: (event: MessageEvent) => void;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		nubeSDK: any;
	}
}

export type {};
