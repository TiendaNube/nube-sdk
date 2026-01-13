/**
 * Compares two objects and returns the paths (as arrays) of all modified keys
 * @param oldObj The previous object
 * @param newObj The new object
 * @param path Current path (used for recursion)
 * @returns Set of paths (as strings) that were modified
 */
export function getModifiedPaths(
	oldObj: unknown,
	newObj: unknown,
	path: string[] = [],
): Set<string> {
	const modifiedPaths = new Set<string>();

	if (oldObj === newObj) {
		return modifiedPaths;
	}

	// Handle null/undefined cases
	if (oldObj == null || newObj == null) {
		if (oldObj !== newObj) {
			modifiedPaths.add(path.join("."));
		}
		return modifiedPaths;
	}

	// Handle primitive types
	if (
		typeof oldObj !== "object" ||
		typeof newObj !== "object" ||
		Array.isArray(oldObj) !== Array.isArray(newObj)
	) {
		if (oldObj !== newObj) {
			modifiedPaths.add(path.join("."));
		}
		return modifiedPaths;
	}

	const oldObjTyped = oldObj as Record<string, unknown>;
	const newObjTyped = newObj as Record<string, unknown>;

	// Get all keys from both objects
	const allKeys = new Set([
		...Object.keys(oldObjTyped),
		...Object.keys(newObjTyped),
	]);

	for (const key of allKeys) {
		const currentPath = [...path, key];
		const oldValue = oldObjTyped[key];
		const newValue = newObjTyped[key];

		// Key was added
		if (!(key in oldObjTyped)) {
			modifiedPaths.add(currentPath.join("."));
			continue;
		}

		// Key was removed
		if (!(key in newObjTyped)) {
			modifiedPaths.add(currentPath.join("."));
			continue;
		}

		// Recursively check nested objects
		if (
			typeof oldValue === "object" &&
			oldValue !== null &&
			typeof newValue === "object" &&
			newValue !== null &&
			!Array.isArray(oldValue) &&
			!Array.isArray(newValue)
		) {
			const nestedPaths = getModifiedPaths(oldValue, newValue, currentPath);
			for (const p of nestedPaths) {
				modifiedPaths.add(p);
			}
		} else if (oldValue !== newValue) {
			// Values are different
			modifiedPaths.add(currentPath.join("."));
		}
	}

	return modifiedPaths;
}
