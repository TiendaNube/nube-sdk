import type {
	NubeComponentColumn,
	NubeComponentColumnProps,
} from "@tiendanube/nube-sdk-types";

/**
 * Creates a `column` component.
 *
 * A `column` is a flexible column container that can be used for structuring layouts.
 * It inherits most properties from `box`, except for the `direction` property.
 *
 * @param props - The properties for configuring the column component.
 * @returns A `NubeComponentColumn` object representing the column component.
 */
export const column = (
	props: NubeComponentColumnProps,
): NubeComponentColumn => ({
	type: "col",
	...props,
});
