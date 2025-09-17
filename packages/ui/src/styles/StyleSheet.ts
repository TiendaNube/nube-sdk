import type { NubeComponentStyle } from "@tiendanube/nube-sdk-types";
import { ThemeColor } from "./ThemeColor";

function parseValue(value: unknown): unknown {
	if (value instanceof ThemeColor) {
		return value.toValue();
	}
	return value;
}

function parseStyleObject(
	style: Record<string, unknown>,
): Record<string, unknown> {
	const parsed: Record<string, unknown> = {};
	for (const key in style) {
		const val = style[key];
		if (
			val &&
			typeof val === "object" &&
			!Array.isArray(val) &&
			!(val instanceof ThemeColor) &&
			Object.prototype.hasOwnProperty.call(val, "toString")
		) {
			parsed[key] = parseStyleObject(val as Record<string, unknown>);
		} else {
			parsed[key] = parseValue(val);
		}
	}
	return parsed;
}

export const StyleSheet = {
	create<T extends { [key: string]: NubeComponentStyle }>(styles: T): T {
		const parsedStyles: Record<string, unknown> = {};
		for (const key in styles) {
			parsedStyles[key] = parseStyleObject(
				styles[key] as Record<string, unknown>,
			);
		}
		return parsedStyles as T;
	},
} as const;
