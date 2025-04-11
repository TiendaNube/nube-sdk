import type { Size } from "@tiendanube/nube-sdk-types";
import type * as CSS from "csstype";
import type { ThemeCSSValue } from "./theme";
import { ThemeColor } from "./ThemeColor";

/**
 * Maps properties that should use the Size type
 */
type SizePropertyKeys =
	| "width"
	| "height"
	| "minWidth"
	| "minHeight"
	| "maxWidth"
	| "maxHeight"
	| "top"
	| "right"
	| "bottom"
	| "left"
	| "margin"
	| "marginTop"
	| "marginBottom"
	| "marginLeft"
	| "marginRight"
	| "padding"
	| "paddingTop"
	| "paddingBottom"
	| "paddingLeft"
	| "paddingRight"
	| "fontSize"
	| "lineHeight"
	| "borderWidth"
	| "borderRadius";

/**
 * Applies Size only to size properties.
 * The others remain as string | number.
 */
type EnhancedCSSProperties = {
	[K in keyof CSS.Properties]?: K extends SizePropertyKeys
		? Size | ThemeCSSValue
		: CSS.Properties[K] | ThemeCSSValue;
};

/**
 * Define named styles
 */
export type NubeComponentStyle = Partial<EnhancedCSSProperties>;

export type NamedStyles<T> = {
	[P in keyof T]: NubeComponentStyle;
};

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
	create<T extends NamedStyles<T>>(styles: T): T {
		const parsedStyles: Record<string, unknown> = {};
		for (const key in styles) {
			parsedStyles[key] = parseStyleObject(styles[key]);
		}
		return parsedStyles as T;
	},
} as const;
