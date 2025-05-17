declare global {
	interface Window {
		__NUBE_SDK_APPS__: { id: number | string; worker: Worker }[];
		__NUBE_DEVTOOLS_EXTENSION__: boolean;
		__NUBE_DEVTOOLS_EXTENSION_CUSTOM_EVENTS__: boolean;
		__nubeSdkListener?: (event: MessageEvent) => void;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		nubeSDK: any;
	}
}

export type {};
