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
	ttl?: number;
};

export type NubeStorageSetResponseEventData = NubeStorageEventDataBase;

export type NubeStorageRemoveEventData = NubeStorageEventDataBase & {
	key: string;
};

export type NubeStorageRemoveResponseEventData = NubeStorageEventDataBase;

export type NubeStorageQueryEventData =
	| NubeStorageGetEventData
	| NubeStorageSetEventData
	| NubeStorageRemoveEventData;

export type NubeStorageQueryResponseEventData =
	| NubeStorageGetResponseEventData
	| NubeStorageSetResponseEventData
	| NubeStorageRemoveResponseEventData;

export type NubeStorageEventData =
	| NubeStorageQueryEventData
	| NubeStorageQueryResponseEventData;

export interface AsyncNubeStorage {
	/**
	 * Returns the value associated with the given key, or null if the key does not exist in the storage.
	 * @param key Key to retrieve the value for.
	 */
	getItem(key: string): Promise<string | null>;

	/**
	 * Sets the value associated with the given key, with an optional expiration date.
	 * If no ttl is specified, then the value will be stored indefinitely.
	 * @param key Key to store the value for.
	 * @param value Value to store.
	 * @param ttl Time-to-live (TTL) in seconds, specifying how long the value should be stored.
	 */
	setItem(key: string, value: string, ttl?: number): Promise<void>;

	/**
	 * Removes the value associated with the given key from the storage.
	 * @param key Key to remove the value for.
	 */
	removeItem(key: string): Promise<void>;
}
