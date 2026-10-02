type Container = Record<string, unknown> | unknown[];

function isContainer(value: unknown): value is Container {
	return typeof value === "object" && value !== null;
}

const hasOwn = (obj: object, key: string) =>
	Object.prototype.hasOwnProperty.call(obj, key);

/**
 * Compares two values structurally and returns the dot-joined paths of every
 * leaf that changed. Objects and arrays are walked recursively (arrays by
 * index), so values that are equal but have a different reference — e.g. state
 * that was serialized across the devtools bridge — are not reported.
 *
 * - Changed primitive / type change: the path of that value.
 * - Added or removed key: the path of that key.
 * - Array length change: the paths of the added/removed indexes.
 *
 * @param oldObj The previous value
 * @param newObj The new value
 * @param path Current path (used for recursion)
 * @returns Set of paths (as strings) that were modified
 */
export function getModifiedPaths(
	oldObj: unknown,
	newObj: unknown,
	path: string[] = [],
): Set<string> {
	const modifiedPaths = new Set<string>();
	collectModifiedPaths(oldObj, newObj, path, modifiedPaths);
	return modifiedPaths;
}

function collectModifiedPaths(
	oldValue: unknown,
	newValue: unknown,
	path: string[],
	modifiedPaths: Set<string>,
): void {
	// Object.is also treats NaN as equal to NaN
	if (Object.is(oldValue, newValue)) {
		return;
	}

	// Primitives, null/undefined, or container vs. primitive
	if (!isContainer(oldValue) || !isContainer(newValue)) {
		modifiedPaths.add(path.join("."));
		return;
	}

	// Array replaced by object (or vice versa)
	if (Array.isArray(oldValue) !== Array.isArray(newValue)) {
		modifiedPaths.add(path.join("."));
		return;
	}

	const oldRecord = oldValue as Record<string, unknown>;
	const newRecord = newValue as Record<string, unknown>;
	const allKeys = new Set([
		...Object.keys(oldRecord),
		...Object.keys(newRecord),
	]);

	for (const key of allKeys) {
		const currentPath = [...path, key];

		// Key added or removed
		if (!hasOwn(oldRecord, key) || !hasOwn(newRecord, key)) {
			modifiedPaths.add(currentPath.join("."));
			continue;
		}

		collectModifiedPaths(
			oldRecord[key],
			newRecord[key],
			currentPath,
			modifiedPaths,
		);
	}
}
