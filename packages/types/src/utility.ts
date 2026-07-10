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

/**
 * All decimal digit characters (`0`-`9`) as a union of string literals.
 */
export type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

/**
 * All lowercase ASCII letters (`a`-`z`) as a union of string literals.
 */
export type LowercaseLetter =
	| "a"
	| "b"
	| "c"
	| "d"
	| "e"
	| "f"
	| "g"
	| "h"
	| "i"
	| "j"
	| "k"
	| "l"
	| "m"
	| "n"
	| "o"
	| "p"
	| "q"
	| "r"
	| "s"
	| "t"
	| "u"
	| "v"
	| "w"
	| "x"
	| "y"
	| "z";

/**
 * Recursively checks whether `S` is composed exclusively of {@link Digit}
 * characters.
 *
 * Resolves to `true` only when `S` is non-empty and made up solely of digits;
 * otherwise resolves to `false`.
 *
 * The non-literal `string` type resolves to `true`, since a value that is not a
 * string literal cannot be validated at the type level and must be accepted.
 *
 * @template S - The string to validate.
 */
export type IsNumericString<S extends string> = string extends S
	? true
	: S extends `${Digit}${infer Rest}`
		? Rest extends ""
			? true
			: IsNumericString<Rest>
		: false;

/**
 * Represents a string literal that contains only digits (`0`-`9`).
 *
 * When used without a type argument it behaves as the broad ``${number}``
 * template. When a string literal is provided as `S`, it is validated through
 * {@link IsNumericString}: valid numeric strings resolve to the literal itself,
 * while any other value resolves to `never`.
 *
 * @template S - The string to validate. Defaults to `string`.
 *
 * @example
 * ```ts
 * type A = NumericString<"123">; // "123"
 * type B = NumericString<"12a">; // never
 * type C = NumericString;         // `${number}`
 * ```
 */
export type NumericString<S extends string = string> = string extends S
	? `${number}`
	: IsNumericString<S> extends true
		? S
		: never;

/**
 * Recursively checks whether every character of `S` is a lowercase letter or a
 * digit, i.e. a single `kebab-case` segment.
 *
 * Resolves to `true` only when `S` is a non-empty run of lowercase letters and
 * digits; otherwise resolves to `false`.
 *
 * @template S - The segment to validate.
 */
type IsKebabCaseSegment<S extends string> =
	S extends `${infer Head}${infer Tail}`
		? Head extends LowercaseLetter | Digit
			? Tail extends ""
				? true
				: IsKebabCaseSegment<Tail>
			: false
		: false;

/**
 * Recursively checks whether `S` is a valid `kebab-case` string: one or more
 * segments of lowercase letters and digits joined by single hyphens.
 *
 * This rejects leading, trailing and consecutive hyphens, since each split
 * segment must be non-empty (see {@link IsKebabCaseSegment}).
 *
 * The non-literal `string` type resolves to `true`, since a value that is not a
 * string literal cannot be validated at the type level and must be accepted.
 *
 * @template S - The `kebab-case` string to validate.
 */
export type IsKebabCase<S extends string> = string extends S
	? true
	: S extends `${infer Head}-${infer Tail}`
		? IsKebabCaseSegment<Head> extends true
			? IsKebabCase<Tail>
			: false
		: IsKebabCaseSegment<S>;
