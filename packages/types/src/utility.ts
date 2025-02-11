/**
 * Creates a new type with the same keys and values as `T`, but removes any
 * extra inferred complexity. Useful for improving type readability.
 */
export type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};

/**
 * Represents a type that can either be `T` or `null`.
 *
 * @template T The base type.
 */
export type Nullable<T> = T | null;

/**
 * Recursively makes all properties of `T` nullable.
 *
 * @template T The base type.
 */
export type DeepNullable<T> = {
	[K in keyof T]: T[K] extends object
		? Nullable<DeepNullable<T[K]>>
		: Nullable<T[K]>;
};

/**
 * Recursively makes all properties of `T` optional.
 *
 * @template T The base type.
 */
export type DeepPartial<T> = {
	[K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

/**
 * Extracts values from an object as a union type.
 *
 * @template T - The object from which to extract values.
 * @example
 * ```ts
 * const Obj = { FOO: 'foo', BAR: 'bar' } as const;
 * type Values = ObjectValues<typeof Obj>; // "foo" | "bar"
 * ```
 */
export type ObjectValues<T> = T[keyof T];
