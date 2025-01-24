import type { UI } from "./components";
import type { AppConfig, AppLocation, Cart, Store } from "./domain";
import type { DeepPartial } from "./utility";

export type NubeSDKState = {
	cart: Cart; // Holds the current cart state and related details
	config: AppConfig; // Represents App config
	location: AppLocation; // Represents the user's current location in the app
	store: Store; // Contains information about the current store
	ui: UI; // Contains UI configuration
};

export type NubeSDKSendableEvent =
	| "cart:validate"
	| "config:set"
	| "ui:slot:set"
	| `custom:${string}:${string}`;

export type NubeSDKListenableEvent =
	| "*"
	| "cart:update"
	| "checkout:ready"
	| "checkout:success"
	| NubeSDKSendableEvent;

export type NubeSDKListener = (
	state: Readonly<NubeSDKState>,
	event: NubeSDKSendableEvent,
) => void;
export type NubeSDKStateModifier = (
	state: Readonly<NubeSDKState>,
) => DeepPartial<NubeSDKState>;

export interface NubeLocalStorage {
	// Returns the value associated with the given key, or null if the key does not exist in the storage.
	getItemAsync(key: string): Promise<string | null>;

	// Sets the value associated with the given key, with an optional expiration date.
	// If no expiration date is specified, then the value will be stored indefinitely.
	// The expiration date is in number of seconds since the UNIX epoch.
	setItem(key: string, value: string, expirationDate?: number): void;
	
	// Removes the value associated with the given key from the storage.
	removeItem(key: string): void;
}

export type NubeSDK = {
	on(event: NubeSDKListenableEvent, listener: NubeSDKListener): void;
	off(event: NubeSDKListenableEvent, listener: NubeSDKListener): void;
	send(event: NubeSDKSendableEvent, modifier?: NubeSDKStateModifier): void;
	getState(): Readonly<NubeSDKState>;
	getLocalStorage(): NubeLocalStorage;
};

export type NubeApp = (nube: NubeSDK) => void;

declare global {
	export interface Window {
		__APP_DATA__: Readonly<{ id: string; script: string }>;
		__INITIAL_STATE__: Readonly<NubeSDKState>;
		__SDK_INSTANCE__: Readonly<NubeSDK>;
	}
}
