export type NubeStorageEvent =
	| "internal:storage:get"
	| "internal:storage:get:response"
	| "internal:storage:set"
	| "internal:storage:set:response"
	| "internal:storage:remove"
	| "internal:storage:remove:response";

export type NubeStorageId = "local-storage" | "session-storage";

export type NubeStorageEventDataBase = {
	requestId: number;
	storageId: NubeStorageId;
};

export type NubeStorageGetEventData = NubeStorageEventDataBase & {
	key: string;
};

export type NubeStorageGetResponseEventData = NubeStorageEventDataBase & {
	key: string;
	value: string | null;
};

export type NubeStorageSetEventData = NubeStorageEventDataBase & {
	key: string;
	value: string;
	expirationDate?: number;
};

export type NubeStorageSetResponseEventData = NubeStorageEventDataBase;

export type NubeStorageRemoveEventData = NubeStorageEventDataBase & {
	key: string;
};

export type NubeStorageRemoveResponseEventData = NubeStorageEventDataBase;

export type NubeStorageEventData =
	| NubeStorageGetEventData
	| NubeStorageGetResponseEventData
	| NubeStorageSetEventData
	| NubeStorageSetResponseEventData
	| NubeStorageRemoveEventData
	| NubeStorageRemoveResponseEventData;

export interface AsyncNubeStorage {
	// Returns the value associated with the given key, or null if the key does not exist in the storage.
	getItem(key: string): Promise<string | null>;

	// Sets the value associated with the given key, with an optional expiration date.
	// If no expiration date is specified, then the value will be stored indefinitely.
	// The expiration date is in number of seconds since the UNIX epoch.
	setItem(key: string, value: string, expirationDate?: number): Promise<void>;

	// Removes the value associated with the given key from the storage.
	removeItem(key: string): Promise<void>;
}
