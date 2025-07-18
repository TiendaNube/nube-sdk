type Props = Record<string, unknown>;

const memo = new WeakMap<object, string>();

/**
 * Serialize the props in a stable way, ignoring functions.
 */
function stableStringify(value: unknown): string {
	return JSON.stringify(value, (_key, val) => {
		if (typeof val === "function") return "[fn]";
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
 * Generate a stable ID for a component based on the type and props.
 */
export function generateInternalId(type: string, props: Props): string {
	// Use cache based on the props reference
	const cached = memo.get(props);
	if (cached) return createId(type, cached);

	const key = stableStringify(props);
	const hash = djb2Hash(key);
	memo.set(props, hash);

	return createId(type, hash);
}
