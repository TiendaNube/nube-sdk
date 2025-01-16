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

export type NubeSDK = {
	on(event: NubeSDKListenableEvent, listener: NubeSDKListener): void;
	off(event: NubeSDKListenableEvent, listener: NubeSDKListener): void;
	send(event: NubeSDKSendableEvent, modifier?: NubeSDKStateModifier): void;
	getState(): Readonly<NubeSDKState>;
};

export type NubeApp = (nube: NubeSDK) => void;

declare global {
	export interface Window {
		__APP_DATA__: Readonly<{ id: string; script: string }>;
		__INITIAL_STATE__: Readonly<NubeSDKState>;
		__SDK_INSTANCE__: Readonly<NubeSDK>;
	}
}
