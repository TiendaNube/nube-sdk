import type {
	NubeComponentCol,
	NubeComponentColProps,
} from "@tiendanube/nube-sdk-types";

/**
 * Creates a `col` (column) component.
 *
 * A `col` is a flexible column container that can be used for structuring layouts.
 * It inherits most properties from `box`, except for the `direction` property.
 *
 * @param props - The properties for configuring the column component.
 * @returns A `NubeComponentCol` object representing the column component.
 */
export const col = (props: NubeComponentColProps): NubeComponentCol => ({
	type: "col",
	...props,
});
