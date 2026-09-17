import "@microlink/react-json-view";
import type { NubeSDKState } from "@tiendanube/nube-sdk-types";

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
	/**
	 * A single event dispatch as reported by the NubeSDK runtime through
	 * `window.__NUBE_SDK_DEVTOOLS_HOOK__`.
	 *
	 * Richer than what a `nubeSDK.on("*")` listener can observe: it carries the
	 * state on both sides of the event's modifier, so the panel can show the
	 * diff of a single event instead of polling `getState()`.
	 */
	type NubeSDKDevtoolsRecord = {
		/** Monotonic dispatch position. A nested send gets the higher number. */
		seq: number;
		event: string;
		/** App (or host) that called `send`. */
		sender: string;
		/** Set when the event was addressed to a single app. */
		target?: string | null;
		payload?: unknown;
		/** State before the event's modifier was applied. */
		prev: NubeSDKState;
		/** State after the modifier, i.e. what the listeners saw. */
		next: NubeSDKState;
		timestamp: number;
	};

	/**
	 * Instrumentation channel exposed by the runtime when
	 * `__NUBE_DEVTOOLS_EXTENSION__` is set (see `inject-extension-flag.js`).
	 *
	 * The runtime honors a hook that is already on the window, so the extension
	 * may install its own — which is what `handleEvents` does when it runs
	 * before the runtime bundle has loaded.
	 */
	type NubeSDKDevtoolsHook = {
		emit(event: Omit<NubeSDKDevtoolsRecord, "seq">): void;
		/** Buffered dispatches, oldest first. */
		records(): NubeSDKDevtoolsRecord[];
		/**
		 * Subscribes to dispatches. The runtime's hook replays its buffer to the
		 * subscriber first, so a panel attached mid-session still gets history.
		 */
		subscribe(subscriber: (record: NubeSDKDevtoolsRecord) => void): () => void;
	};

	interface Window {
		__NUBE_DEVTOOLS_EXTENSION__: boolean;
		__NUBE_DEVTOOLS_EXTENSION_CUSTOM_EVENTS__: boolean;
		__NUBE_SDK_DEVTOOLS_HOOK__?: NubeSDKDevtoolsHook;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		nubeSDK: any;
	}
}
