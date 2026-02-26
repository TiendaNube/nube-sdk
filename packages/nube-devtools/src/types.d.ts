import "@microlink/react-json-view";

declare module "@microlink/react-json-view" {
	interface ReactJsonViewProps {
		/**
		 * When set to false, commas are not displayed after values.
		 *
		 * Default: true
		 */
		showComma?: boolean;
	}
}

declare global {
	interface Window {
		__NUBE_DEVTOOLS_EXTENSION__: boolean;
		__NUBE_DEVTOOLS_EXTENSION_CUSTOM_EVENTS__: boolean;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		nubeSDK: any;
	}
}
