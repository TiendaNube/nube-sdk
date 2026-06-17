/**
 * @fileoverview General utility functions for NubeSDK
 *
 * This module provides general-purpose utility functions including
 * deep cloning, debouncing, and throttling capabilities.
 */

/**
 * Deep clones a value.
 *
 * Uses the structured clone algorithm when available (it is, in the NubeSDK
 * Web Worker runtime), which correctly handles `Date`, `Map`, `Set`, typed
 * arrays and circular references. Falls back to JSON serialization in
 * environments without `structuredClone` (with the usual JSON limitations:
 * functions, symbols and `undefined` are dropped).
 *
 * @template T - The type of the value to clone
 * @param obj - The value to deep clone
 * @returns A deep clone of the input value
 *
 * @example
 * ```typescript
 * const original = { name: 'John', age: 30, hobbies: ['reading', 'coding'] };
 * const cloned = deepClone(original);
 *
 * cloned.name = 'Jane';
 * cloned.hobbies.push('gaming');
 *
 * console.log(original.name); // 'John' (unchanged)
 * console.log(original.hobbies); // ['reading', 'coding'] (unchanged)
 * ```
 *
 * @since 0.1.0
 */
export function deepClone<T>(obj: T): T {
	if (obj === null || typeof obj !== "object") {
		return obj;
	}
	if (typeof structuredClone === "function") {
		return structuredClone(obj);
	}
	return JSON.parse(JSON.stringify(obj));
}

/**
 * Debounces a function call, ensuring it only executes after a specified
 * delay has passed since the last invocation.
 *
 * @template T - The function type
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns A debounced version of the function
 *
 * @example
 * ```typescript
 * const debouncedSearch = debounce((query: string) => {
 *   console.log('Searching for:', query);
 *   // Perform search operation
 * }, 300);
 *
 * // Multiple rapid calls will only execute the last one after 300ms
 * debouncedSearch('a');
 * debouncedSearch('ab');
 * debouncedSearch('abc'); // Only this will execute
 * ```
 *
 * @since 0.1.0
 */
export function debounce<T extends (...args: never[]) => unknown>(
	func: T,
	wait: number,
): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout> | undefined;

	return (...args: Parameters<T>): void => {
		const later = () => {
			timeout = undefined;
			func(...args);
		};

		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(later, wait);
	};
}

/**
 * Creates a throttled version of a function that will only execute
 * at most once per specified time limit.
 *
 * @template T - The function type
 * @param func - The function to throttle
 * @param limit - The time limit in milliseconds
 * @returns A throttled version of the function
 *
 * @example
 * ```typescript
 * const throttledScroll = throttle((event: Event) => {
 *   console.log('Scroll event:', event);
 *   // Handle scroll event
 * }, 100);
 *
 * // Even with rapid scroll events, the function will only execute
 * // once every 100ms
 * window.addEventListener('scroll', throttledScroll);
 * ```
 *
 * @since 0.1.0
 */
export function throttle<T extends (...args: never[]) => unknown>(
	func: T,
	limit: number,
): (...args: Parameters<T>) => void {
	let inThrottle: boolean;

	return (...args: Parameters<T>): void => {
		if (!inThrottle) {
			func(...args);
			inThrottle = true;
			setTimeout(() => {
				inThrottle = false;
			}, limit);
		}
	};
}
