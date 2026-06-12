/**
 * @fileoverview Internal primitive type guards shared across the guards folder.
 *
 * These are building blocks used by the domain-specific guards. They are NOT
 * part of the package's public API and are intentionally not re-exported by
 * `guards/index.ts`.
 *
 * @internal
 */

/**
 * Internal type guard to check if a value is any kind of object (including arrays, dates, etc.)
 * Excludes null and primitive values
 *
 * @internal
 */
export function isObject(value: unknown): value is object {
	return typeof value === "object" && value !== null;
}

/**
 * Internal type guard to check if a value is a plain object (not array, date, or other built-in objects)
 *
 * @internal
 */
export function isPlainObject(
	value: unknown,
): value is Record<string, unknown> {
	return (
		isObject(value) &&
		!Array.isArray(value) &&
		Object.prototype.toString.call(value) === "[object Object]"
	);
}
