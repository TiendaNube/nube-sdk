export const NubeLocalStorageGetEvent = "localstorage:get";
export const NubeLocalStorageGetResponseEvent = "localstorage:get:response";
export const NubeLocalStorageSetEvent = "localstorage:set";
export const NubeLocalStorageRemoveEvent = "localstorage:remove";

export type NubeLocalStorageGetEventData = {
	requestId: number;
	key: string;
};

export type NubeLocalStorageGetResponseEventData = {
	requestId: number;
	key: string;
	value: string | null;
};

export type NubeLocalStorageSetEventData = {
	key: string;
	value: string;
	expirationDate?: number;
};

export type NubeLocalStorageRemoveEventData = {
	key: string;
};

export interface NubeLocalStorage {
	// Returns the value associated with the given key, or null if the key does not exist in the storage.
	getItemAsync(key: string): Promise<string | null>;

	// Sets the value associated with the given key, with an optional expiration date.
	// If no expiration date is specified, then the value will be stored indefinitely.
	// The expiration date is in number of seconds since the UNIX epoch.
	//TODO: Make async
	setItem(key: string, value: string, expirationDate?: number): void;

	// Removes the value associated with the given key from the storage.
	//TODO: Make async
	removeItem(key: string): void;
}
