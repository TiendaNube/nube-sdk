import type { JsonObject } from "./components";

export type NubeStorageEvent =
	| "internal:storage:get"
	| "internal:storage:get:response"
	| "internal:storage:set"
	| "internal:storage:set:response"
	| "internal:storage:remove"
	| "internal:storage:remove:response"
	| "internal:navigate"
	| "internal:iframe:message"
	| "internal:form:submit"
	| "internal:form:reset"
	| "internal:form:file:get"
	| "internal:form:file:get:response"
	| "internal:page:scroll_to";

export type NubeStorageId = "local-storage" | "session-storage";

/**
 * Who a stored value belongs to.
 *
 * - `"script"`: only the script that wrote it (the default).
 * - `"app"`: every script of the same app. An app with a single script has
 *   one scope only, so both values read and write the same data.
 */
export type NubeStorageScope = "script" | "app";

export type NubeStorageEventDataBase = {
	requestId: number;
	storageId: NubeStorageId;
};

export type NubeStorageGetEventData = NubeStorageEventDataBase & {
	key: string;
	scope?: NubeStorageScope;
};

export type NubeStorageGetResponseEventData = NubeStorageEventDataBase & {
	key: string;
	value: string | null;
};

export type NubeStorageSetEventData = NubeStorageEventDataBase & {
	key: string;
	value: string;
	ttl?: number;
	scope?: NubeStorageScope;
};

export type NubeStorageSetResponseEventData = NubeStorageEventDataBase;

export type NubeStorageRemoveEventData = NubeStorageEventDataBase & {
	key: string;
	scope?: NubeStorageScope;
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

/**
 * Named destinations that can be passed to `navigate` instead of a route.
 * The SDK resolves each alias to the right URL for the current store.
 */
export type NubeNavigateAlias = "checkout" | "login";

/**
 * A navigation target: either a relative route starting with '/' or a
 * {@link NubeNavigateAlias}.
 */
export type NubeNavigateRoute = `/${string}` | NubeNavigateAlias;

export type NubeNavigateEventData = {
	route: NubeNavigateRoute;
};

export type NubeScrollToEventData = {
	top?: number;
	left?: number;
	behavior?: "smooth" | "auto" | "instant";
};

export type NubeIframeMessageEventData = {
	iframeId: string;
	message: JsonObject;
	src?: string;
};

/**
 * Payload carried by the `internal:form:submit` / `internal:form:reset`
 * events fired by `browser.submitForm` / `browser.resetForm`. The
 * `formId` is the `__internalId` of the target `Form.Root` and encodes the
 * app id by construction (`formRoot-<appId>-<hash>`), so the main-thread
 * handler can validate ownership with a string-prefix check.
 */
export type NubeFormActionEventData = {
	formId: string;
};

/**
 * Request fired by `browser.getFormFile`. `formId` is the `__internalId` of
 * the target `Form.Root`, validated for ownership the same way as
 * {@link NubeFormActionEventData}.
 */
export type NubeFormFileGetEventData = {
	requestId: number;
	formId: string;
	fieldName: string;
};

/**
 * Response to `internal:form:file:get`. Unlike other internal messages it is
 * posted as a structured-clone object (not a JSON string) so the `File`
 * survives the worker boundary.
 */
export type NubeFormFileGetResponseEventData = {
	requestId: number;
	file: File | null;
};

export interface AsyncNubeStorage {
	/**
	 * Returns the value associated with the given key, or null if the key does not exist in the storage.
	 * @param key Key to retrieve the value for.
	 * @param scope `"script"` (default) reads this script's own value; `"app"` reads the value shared by every script of the app.
	 */
	getItem(key: string, scope?: NubeStorageScope): Promise<string | null>;

	/**
	 * Sets the value associated with the given key, with an optional expiration date.
	 * If no ttl is specified, then the value will be stored indefinitely.
	 * @param key Key to store the value for.
	 * @param value Value to store.
	 * @param ttl Time-to-live (TTL) in seconds, specifying how long the value should be stored.
	 * @param scope `"script"` (default) stores the value for this script only; `"app"` shares it with every script of the app.
	 */
	setItem(
		key: string,
		value: string,
		ttl?: number,
		scope?: NubeStorageScope,
	): Promise<void>;

	/**
	 * Removes the value associated with the given key from the storage.
	 * @param key Key to remove the value for.
	 * @param scope `"script"` (default) removes this script's own value; `"app"` removes the value shared by every script of the app.
	 */
	removeItem(key: string, scope?: NubeStorageScope): Promise<void>;
}
