type Props = Record<string, unknown>;

const memo = new WeakMap<object, string>();

/**
 * Id of a signal node (`{ type: "signal", __internalId }`) passed as a child.
 */
function signalId(child: unknown): string | undefined {
	if (typeof child !== "object" || child === null) return undefined;
	const { type, __internalId } = child as Record<string, unknown>;
	return type === "signal" && typeof __internalId === "string"
		? __internalId
		: undefined;
}

/**
 * Children made of components only count as "has children". Signals are
 * the exception: every signal is unique, so they enter the key by id, and
 * two instances of a component that render different signals get different
 * ids.
 */
function childrenKey(children: unknown): string {
	const list = Array.isArray(children) ? children : [children];
	const signals = list.map(signalId).filter(Boolean);
	return signals.length > 0 ? `[children:${signals.join(",")}]` : "[children]";
}

/**
 * Serialize the props in a stable way, ignoring functions.
 */
function stableStringify(value: unknown): string {
	return JSON.stringify(value, (key, val) => {
		if (key === "children" && typeof val !== "string") return childrenKey(val);
		if (typeof val === "function") {
			if (memo.has(val)) return memo.get(val);

			const fnid = `[${val.toString()}]`;

			memo.set(val, fnid);

			return fnid;
		}
		return val;
	});
}

/**
 * djb2 hash function (32 bits, returning base36 for reduced size).
 */
function djb2Hash(str: string): string {
	let hash = 5381;
	for (let i = 0; i < str.length; i++) {
		hash = (hash * 33) ^ str.charCodeAt(i);
	}
	return (hash >>> 0).toString(36); // eg: "1v3tuh"
}

function createId(type: string, hash: string) {
	return `${type}-${self.__APP_DATA__.id}-${hash}`;
}

/**
 * Regular expression to validate the internal ID format: {type}-{appId}-{hash}
 * - type: component type (letters, numbers, underscore, hyphen)
 * - appId: application ID (alphanumeric)
 * - hash: base36 hash (letters and numbers)
 */
function createInternalIdRegex(appId: string): RegExp {
	// Escape special regex characters in appId
	const escapedAppId = appId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	return new RegExp(`^[a-zA-Z0-9_-]+-${escapedAppId}-[a-z0-9]+$`);
}

function isValidInternalId(id: unknown): id is string {
	if (typeof id !== "string" || id === "") return false;

	const regex = createInternalIdRegex(self.__APP_DATA__.id);
	return regex.test(id);
}

/**
 * Generate a stable ID for a component based on the type and props.
 */
export function generateInternalId(type: string, props: Props): string {
	if (isValidInternalId(props.__internalId)) return props.__internalId;

	const cached = memo.get(props);
	if (cached) return createId(type, cached);

	const key = stableStringify(props);
	const hash = djb2Hash(key);
	memo.set(props, hash);

	return createId(type, hash);
}
