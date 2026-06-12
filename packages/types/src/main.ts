import type { AppSettingsValues } from "./app-settings";
import type { NubeBrowserAPIs } from "./browser";
import type { NubeComponent, UI } from "./components";
import type {
	AppConfig,
	AppLocation,
	Cart,
	Customer,
	Device,
	Order,
	Payment,
	Session,
	Shipping,
	Store,
} from "./domain";
import type {
	NubeSDKListenableEvent,
	NubeSDKListenableSuccessEvent,
	NubeSDKSendableEvent,
} from "./events";

import type { UISlot } from "./slots";
import type { DeepPartial, Nullable } from "./utility";

/**
 * Represents the current state of the NubeSDK.
 * This state is immutable and contains all relevant application data.
 */
export type NubeSDKState = {
	/**
	 * The current order state, containing order status and tracking statuses.
	 */
	order?: Order;
	/**
	 * The current device state, containing screen information.
	 */
	device: Device;

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
	 * Information about shipping, such as available options, the selected option, and custom labels.
	 * This property may be null depending on the page it is accessed from.
	 */
	shipping: Nullable<Shipping>;

	/**
	 * Details about the customer, including identification, contact information, and address.
	 */
	customer: Nullable<Customer>;

	/**
	 * Information about the payment method, including type, status, and selected option.
	 */
	payment: Nullable<Payment>;

	/**
	 * Optional event payload
	 */
	eventPayload: Nullable<Record<string, unknown>>;

	/**
	 * Information about the session, including the session ID.
	 */
	session: Session;
};

/*
 * Represents an optional event payload.
 */
export type OptionalEventPayload = { eventPayload?: Record<string, unknown> };

/**
 * Represents a listener function that responds to SDK events.
 *
 * @param state - The current immutable state of the SDK.
 * @param event - The event that was triggered.
 */
export type NubeSDKListener = (
	state: Readonly<NubeSDKState>,
	event: NubeSDKListenableEvent,
) => void;

/**
 * Represents a listener function that responds to SDK events with state and payload.
 *
 * @param state - The current immutable state of the SDK.
 * @param event - The event that was triggered.

 */
export type NubeSDKListenerWithPayload = (
	state: Readonly<NubeSDKState> & OptionalEventPayload,
	event: NubeSDKListenableSuccessEvent,
) => void;

/**
 * Maps the events to the appropriate listener type.
 *
 * @type {EventListenerMap}
 */
export type EventListenerMap = {
	[K in NubeSDKListenableSuccessEvent]: NubeSDKListenerWithPayload;
} & {
	[K in Exclude<
		NubeSDKListenableEvent,
		NubeSDKListenableSuccessEvent
	>]: NubeSDKListener;
};

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
 * Represents a function that modifies the SDK state with a payload.
 *
 * @param state - The current immutable state of the SDK. The event payload is available on state.payload.
 * @returns A partial update of the SDK state.
 */
export type NubeSDKStateModifierWithPayload = (
	state: Readonly<NubeSDKState> & OptionalEventPayload,
) => DeepPartial<NubeSDKState>;

/**
 * Maps the events to the appropriate state modifier type.
 *
 * @type {NubeSDKStateModifierMap}
 */
export type NubeSDKStateModifierMap = {
	// Eventos :success recebem o listener com payload
	[K in NubeSDKListenableSuccessEvent]: NubeSDKStateModifierWithPayload;
} & {
	// Todos os outros eventos recebem o listener padrão
	[K in Exclude<
		NubeSDKListenableEvent,
		NubeSDKListenableSuccessEvent
	>]: NubeSDKStateModifier;
};

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
	on<T extends NubeSDKListenableEvent>(
		event: T,
		listener: EventListenerMap[T],
	): void;

	/**
	 * Removes a registered event listener.
	 *
	 * @param event - The event type to stop listening for.
	 * @param listener - The function that was previously registered.
	 */
	off<T extends NubeSDKListenableEvent>(
		event: T,
		listener: EventListenerMap[T],
	): void;

	/**
	 * Sends an event to the SDK, optionally modifying the state.
	 *
	 * @param event - The event type to send.
	 * @param modifier - An optional function to modify the SDK state.
	 */
	send<T extends NubeSDKSendableEvent>(
		event: T,
		modifier?: NubeSDKStateModifierMap[T],
	): void;

	/**
	 * Retrieves the current immutable state of the SDK.
	 *
	 * @returns The current state of NubeSDK.
	 */
	getState(): Readonly<NubeSDKState>;

	/**
	 * Returns the browser APIs that can be used in the web worker.
	 *
	 * @returns The available browser APIs.
	 */
	getBrowserAPIs(): NubeBrowserAPIs;

	/**
	 * Renders a component into a specific UI slot.
	 * The component can be either a static component or a function that receives the current state
	 * and returns a component to render.
	 *
	 * @param slot - The UI slot where the component will be rendered.
	 * @param component - The component to render, either a static component or a function that returns a component based on the current state.
	 */
	render(
		slot: UISlot,
		component:
			| NubeComponent
			| NubeComponent[]
			| ((state: Readonly<NubeSDKState>) => NubeComponent | NubeComponent[]),
	): void;

	/**
	 * Clears a component from a specific UI slot, removing it from the NubeSDKState.
	 *
	 * @param slot - The UI slot from which the component will be cleared.
	 */
	clearSlot(slot: UISlot): void;

	/**
	 * Retrieves the app settings values for the current app.
	 *
	 * @returns The app settings values, or an empty object if not available.
	 */
	getAppSettings(): AppSettingsValues;
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
