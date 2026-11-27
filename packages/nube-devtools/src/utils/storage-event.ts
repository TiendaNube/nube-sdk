/**
 * Validation for storage events relayed from the page.
 *
 * Events reach the panel from a `CustomEvent` on the page's `window`, which
 * any script on the page can dispatch with any `detail`. Nothing about their
 * shape can be assumed: `type` ends up addressing `window[type]` on write-back
 * and keys render lookups, and a non-string `value` breaks rendering.
 */
import type { PageStorageType } from "./page-storage";

export type StorageEventMethod = "setItem" | "removeItem" | "clear";

/** One storage mutation as reported by the injected page patch. */
export type NubeSDKStorageEvent = {
	method: StorageEventMethod;
	type: PageStorageType;
	key: string;
	value: string | null;
	timestamp?: number;
};

const METHODS: readonly StorageEventMethod[] = [
	"setItem",
	"removeItem",
	"clear",
];

export const isPageStorageType = (type: unknown): type is PageStorageType =>
	type === "localStorage" || type === "sessionStorage";

/**
 * Returns the event rebuilt from known fields only, or null when its shape
 * does not match what the page patch sends.
 */
export function parseStorageEvent(raw: unknown): NubeSDKStorageEvent | null {
	if (typeof raw !== "object" || raw === null) return null;
	const candidate = raw as Record<string, unknown>;

	const { method, type, key, value, timestamp } = candidate;
	if (!METHODS.includes(method as StorageEventMethod)) return null;
	if (!isPageStorageType(type)) return null;
	if (typeof key !== "string") return null;
	if (value !== null && value !== undefined && typeof value !== "string") {
		return null;
	}
	// A write without a value has nothing to show.
	if (method === "setItem" && typeof value !== "string") return null;
	if (
		timestamp !== undefined &&
		(typeof timestamp !== "number" || !Number.isFinite(timestamp))
	) {
		return null;
	}

	return {
		method: method as StorageEventMethod,
		type,
		key,
		value: typeof value === "string" ? value : null,
		...(timestamp !== undefined ? { timestamp } : {}),
	};
}
