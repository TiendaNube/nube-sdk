import type {
	NubeComponentBox,
	NubeComponentBoxProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Prefixes each class in `className` with the app id (`app-{appId}_{class}`),
 * scoping it to the app. Classes that already carry the prefix are kept as is.
 * Returns an object ready to be spread into the props, or an empty object when
 * `className` is undefined.
 */
function scopeClassName(className?: string): { className?: string } {
	if (className === undefined) return {};
	const prefix = `app-${self.__APP_DATA__.id}_`;
	return {
		className: className
			.split(/\s+/)
			.filter(Boolean)
			.map((name) => (name.startsWith(prefix) ? name : `${prefix}${name}`))
			.join(" "),
	};
}

/**
 * Creates a `box` component.
 *
 * A `box` is a flexible container that can be used for layout purposes.
 * It supports properties like width, height, padding, margin, and flex-based alignment.
 *
 * @param props - The properties for configuring the box component.
 * @returns A `NubeComponentBox` object representing the box component.
 */
export const box = (props: NubeComponentBoxProps): NubeComponentBox => ({
	type: "box",
	...props,
	...scopeClassName(props.className),
	__internalId: generateInternalId("box", props),
});
