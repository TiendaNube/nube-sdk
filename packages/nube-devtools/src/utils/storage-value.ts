/**
 * NubeSDK does not persist an app's value on its own: `setItem(key, value,
 * ttl?)` accepts an expiration, which has to be stored next to the value to be
 * enforced on the next read. What lands in the page's storage is therefore an
 * envelope around the value, not the value itself.
 *
 * The panel edits what is *inside* that envelope and never the envelope. Handing
 * the raw JSON to a textarea would let the `value` key be renamed or dropped,
 * and NubeSDK would then read the entry as absent — the app's data would become
 * silently unreachable, with nothing in the UI to hint at why.
 */

type Envelope = Record<string, unknown>;

/**
 * The envelope field holding the expiration.
 *
 * Named `ttl` but holding an **absolute** epoch-ms deadline, not a duration:
 * `setItem` takes a time-to-live in seconds and the SDK resolves it against
 * the write time before persisting, since a duration would be meaningless to
 * a later read.
 */
export const EXPIRATION_FIELD = "ttl";

/**
 * How the edited text maps back onto the stored payload.
 *
 * - `string`: the envelope's value was a plain string, which is what the
 *   `setItem` contract produces. The text is that string, literally.
 * - `json`: the envelope's value was not a string. The text is its JSON form
 *   and a save has to parse it back, so that a value written by something
 *   other than the documented API still round-trips unchanged.
 * - `raw`: the payload is not a recognized envelope. The text is the whole
 *   stored string. There is no `value` key to protect in this case.
 */
export type StorageValueEncoding = "string" | "json" | "raw";

export type UnwrappedStorageValue = {
	/** What the editor shows and the user edits. */
	text: string;
	encoding: StorageValueEncoding;
	/**
	 * The envelope fields other than `value` — TTL, expiration, anything a
	 * future SDK version adds. Split out for display only.
	 */
	metadata: Envelope;
	/**
	 * The envelope as parsed, key order intact, and null when there was none.
	 *
	 * A save rebuilds from this rather than from `metadata` plus a fresh
	 * `value`: spreading the original overwrites `value` in the position it
	 * already occupies, so re-saving an unchanged entry writes back a payload
	 * byte-identical to what was there. Metadata this panel knows nothing
	 * about rides along untouched either way.
	 */
	envelope: Envelope | null;
	/**
	 * When the entry stops being readable, epoch ms, or null for one stored
	 * without a TTL.
	 *
	 * Worth surfacing on its own rather than as one more metadata row: an
	 * expired entry is still physically in storage, so it shows up here while
	 * the app that wrote it already reads it as absent. That gap is exactly
	 * what someone would open this panel to explain.
	 */
	expiresAt: number | null;
};

function isPlainObject(candidate: unknown): candidate is Envelope {
	return (
		typeof candidate === "object" &&
		candidate !== null &&
		!Array.isArray(candidate)
	);
}

/**
 * Splits a stored payload into the app's value and the envelope around it.
 */
export function unwrapStorageValue(raw: string): UnwrappedStorageValue {
	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		// Not JSON at all: an app is free to have written through the plain
		// browser API under a NubeSDK-shaped key.
		return {
			text: raw,
			encoding: "raw",
			metadata: {},
			envelope: null,
			expiresAt: null,
		};
	}

	// An envelope is recognized by the `value` key alone. Nothing else is
	// assumed about its shape, so a new metadata field does not turn every
	// entry unreadable here.
	if (!isPlainObject(parsed) || !("value" in parsed)) {
		return {
			text: raw,
			encoding: "raw",
			metadata: {},
			envelope: null,
			expiresAt: null,
		};
	}

	const { value, ...rest } = parsed;

	// A malformed expiration is deliberately left in `metadata` instead of
	// being dropped: it still explains an entry the SDK refuses to read, and
	// hiding it would make that entry look ordinary.
	const expiration = rest[EXPIRATION_FIELD];
	const hasExpiration =
		typeof expiration === "number" && Number.isFinite(expiration);

	const { [EXPIRATION_FIELD]: _expiration, ...withoutExpiration } = rest;
	const metadata = hasExpiration ? withoutExpiration : rest;
	const expiresAt = hasExpiration ? expiration : null;

	if (typeof value === "string") {
		return {
			text: value,
			encoding: "string",
			metadata,
			envelope: parsed,
			expiresAt,
		};
	}

	return {
		text: JSON.stringify(value, null, 2),
		encoding: "json",
		metadata,
		envelope: parsed,
		expiresAt,
	};
}

export type WrapResult =
	| { ok: true; raw: string }
	| { ok: false; error: string };

/**
 * Rebuilds the stored payload from edited text, putting it back exactly where
 * it came from.
 */
export function wrapStorageValue(
	unwrapped: UnwrappedStorageValue,
	text: string,
): WrapResult {
	if (unwrapped.encoding === "raw" || unwrapped.envelope === null) {
		return { ok: true, raw: text };
	}

	if (unwrapped.encoding === "string") {
		return {
			ok: true,
			raw: JSON.stringify({ ...unwrapped.envelope, value: text }),
		};
	}

	try {
		return {
			ok: true,
			raw: JSON.stringify({
				...unwrapped.envelope,
				value: JSON.parse(text),
			}),
		};
	} catch {
		// Refused rather than coerced to a string: writing the text verbatim
		// would change the value's type behind the user's back.
		return { ok: false, error: "The value is not valid JSON" };
	}
}
