import type { NubeBrowserAPIs } from "./browser";
import type { UI } from "./components";
import type { AppConfig, AppLocation, Cart, Shipping, Store } from "./domain";
import type { NubeSDKListenableEvent, NubeSDKSendableEvent } from "./events";
import type { DeepPartial, Nullable } from "./utility";

/**
 * Represents the current state of the NubeSDK.
 * This state is immutable and contains all relevant application data.
 */
export type NubeSDKState = {
	/**
	 * The current cart state, containing products, pricing, and validation status.
	 */
	cart: Cart;

	/**
	 * Application-wide configuration settings, including cart validation rules.
	 */
	config: AppConfig;

	/**
	 * The user's current location within the application, including the page type and URL.
	 */
	location: AppLocation;

	/**
	 * Information about the current store, such as its domain, currency, and language.
	 */
	store: Store;

	/**
	 * Represents UI-related state, including dynamically injected components and their values.
	 */
	ui: UI;

	/**
	 * Informaion about shipping, such as avaliable options, selected option and custom labels.
	 * This property may be null depending on the page it is accessed from.
	 */
	shipping: Nullable<Shipping>;
};

/**
 * Represents a listener function that responds to SDK events.
 *
 * @param state - The current immutable state of the SDK.
 * @param event - The event that was triggered.
 */
export type NubeSDKListener = (
	state: Readonly<NubeSDKState>,
	event: NubeSDKSendableEvent,
) => void;

/**
 * Represents a function that modifies the SDK state.
 * It receives the current state and returns a partial update.
 *
 * @param state - The current immutable state of the SDK.
 * @returns A partial update of the SDK state.
 */
export type NubeSDKStateModifier = (
	state: Readonly<NubeSDKState>,
) => DeepPartial<NubeSDKState>;

/**
 * Represents the main interface for interacting with NubeSDK.
 * Provides methods to listen to events, send events, and retrieve state.
 */
export type NubeSDK = {
	/**
	 * Registers an event listener.
	 *
	 * @param event - The event type to listen for.
	 * @param listener - The function to execute when the event occurs.
	 */
	on(event: NubeSDKListenableEvent, listener: NubeSDKListener): void;

	/**
	 * Removes a registered event listener.
	 *
	 * @param event - The event type to stop listening for.
	 * @param listener - The function that was previously registered.
	 */
	off(event: NubeSDKListenableEvent, listener: NubeSDKListener): void;

	/**
	 * Sends an event to the SDK, optionally modifying the state.
	 *
	 * @param event - The event type to send.
	 * @param modifier - An optional function to modify the SDK state.
	 */
	send(event: NubeSDKSendableEvent, modifier?: NubeSDKStateModifier): void;

	/**
	 * Retrieves the current immutable state of the SDK.
	 *
	 * @returns The current state of NubeSDK.
	 */
	getState(): Readonly<NubeSDKState>;
	getBrowserAPIs(): NubeBrowserAPIs;
};

/**
 * Represents a Nube application, which is a function that receives
 * an instance of `NubeSDK` to interact with.
 *
 * @param nube - The NubeSDK instance provided to the application.
 */
export type NubeApp = (nube: NubeSDK) => void;

declare global {
	export interface Window {
		__APP_DATA__: Readonly<{ id: string; script: string }>;
		__INITIAL_STATE__: Readonly<NubeSDKState>;
		__SDK_INSTANCE__: Readonly<NubeSDK>;
	}
}
