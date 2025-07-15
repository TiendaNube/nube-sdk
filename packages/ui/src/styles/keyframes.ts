import { minify } from "./minify";
import { shortid } from "./shortid";

export type KeyframesObject = {
	name: string;
	css: string;
	toString(): string;
};

/**
 * Generates a unique name and returns a keyframes object that can be interpolated in template literals.
 */
export function keyframes(
	strings: TemplateStringsArray,
	...exprs: unknown[]
): KeyframesObject {
	const rawCSS = String.raw({ raw: strings }, ...exprs);
	const css = minify(rawCSS);
	const id = `kf-${shortid()}`;

	return {
		name: id,
		css: `@keyframes ${id}{${css}}`,
		toString() {
			return id;
		},
	};
}

/**
 * Type guard to check if an object is a keyframes object.
 * @param value - The object to check.
 * @returns True if the object is a keyframes object, false otherwise.
 */
export function isKeyframesObject(value: unknown): value is KeyframesObject {
	return (
		typeof value === "object" &&
		value !== null &&
		"css" in value &&
		"name" in value &&
		"toString" in value &&
		typeof (value as KeyframesObject).toString === "function"
	);
}
